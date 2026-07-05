/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

// Fields of the board itself that are safe/useful to carry across boards. Instance-specific
// associations (project, memberships, ids, timestamps) are intentionally left out.
const BOARD_SETTING_KEYS = [
  'name',
  'defaultView',
  'defaultCardType',
  'limitCardTypesToDefaultOne',
  'alwaysDisplayCardCreator',
  'displayCardAges',
  'expandTaskListsByDefault',
  'displayLabelPlaceholder',
  'addCardToTop',
  'keepOpenAfterCardCreate',
  'autoCloseLabelSelectorAfterSelection',
  'showAddCardButtonAtTop',
];

module.exports = {
  inputs: {
    board: {
      type: 'ref',
      required: true,
    },
  },

  async fn(inputs) {
    const { board } = inputs;

    const labels = await Label.qm.getByBoardId(board.id);
    const customFilters = await CustomFilter.qm.getByBoardId(board.id);
    const lists = await List.qm.getByBoardId(board.id);

    // Only finite lists (active/closed) hold real, exportable cards.
    const finiteLists = lists.filter((list) => sails.helpers.lists.isFinite(list));
    const finiteListIds = sails.helpers.utils.mapRecords(finiteLists);

    const cards = await Card.qm.getByListIds(finiteListIds);
    const cardIds = sails.helpers.utils.mapRecords(cards);

    const cardLabels = await CardLabel.qm.getByCardIds(cardIds);

    const taskLists = await TaskList.qm.getByCardIds(cardIds);
    const taskListIds = sails.helpers.utils.mapRecords(taskLists);
    const tasks = await Task.qm.getByTaskListIds(taskListIds);

    const attachments = await Attachment.qm.getByCardIds(cardIds);
    const comments = await Comment.qm.getByCardIds(cardIds);

    // Only self-contained custom field groups (those not derived from a project-level base
    // group) can be recreated on an arbitrary target board, so we skip base-derived ones.
    const boardCustomFieldGroups = await CustomFieldGroup.qm.getByBoardId(board.id);
    const cardCustomFieldGroups = await CustomFieldGroup.qm.getByCardIds(cardIds);

    const customFieldGroups = [...boardCustomFieldGroups, ...cardCustomFieldGroups].filter(
      (customFieldGroup) => !customFieldGroup.baseCustomFieldGroupId,
    );
    const customFieldGroupIds = sails.helpers.utils.mapRecords(customFieldGroups);

    const customFields = await CustomField.qm.getByCustomFieldGroupIds(customFieldGroupIds);
    const allCustomFieldValues = await CustomFieldValue.qm.getByCardIds(cardIds);

    const customFieldGroupIdsSet = new Set(customFieldGroupIds);
    const customFieldValues = allCustomFieldValues.filter((customFieldValue) =>
      customFieldGroupIdsSet.has(customFieldValue.customFieldGroupId),
    );

    const fileAttachments = attachments
      .filter((attachment) => attachment.type === Attachment.Types.FILE)
      .map((attachment) => ({
        attachmentId: attachment.id,
        uploadedFileId: attachment.data.uploadedFileId,
        filename: attachment.data.filename,
      }));

    const exportData = {
      formatVersion: 1,
      exportedAt: new Date().toISOString(),
      board: _.pick(board, BOARD_SETTING_KEYS),
      labels,
      customFilters,
      lists: finiteLists,
      cards,
      cardLabels,
      taskLists,
      tasks,
      customFieldGroups,
      customFields,
      customFieldValues,
      comments,
      attachments,
    };

    return {
      exportData,
      fileAttachments,
    };
  },
};
