/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    values: {
      type: 'ref',
      required: true,
    },
    actorUser: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const { values } = inputs;

    const customFilters = await CustomFilter.qm.getByBoardId(values.board.id);

    const { position, repositions } = sails.helpers.utils.insertToPositionables(
      values.position,
      customFilters,
    );

    // eslint-disable-next-line no-restricted-syntax
    for (const reposition of repositions) {
      // eslint-disable-next-line no-await-in-loop
      await CustomFilter.qm.updateOne(
        {
          id: reposition.record.id,
          boardId: reposition.record.boardId,
        },
        {
          position: reposition.position,
        },
      );

      sails.sockets.broadcast(`board:${values.board.id}`, 'customFilterUpdate', {
        item: {
          id: reposition.record.id,
          position: reposition.position,
        },
      });
    }

    const customFilter = await CustomFilter.qm.createOne({
      ...values,
      position,
      boardId: values.board.id,
    });

    sails.sockets.broadcast(
      `board:${customFilter.boardId}`,
      'customFilterCreate',
      {
        item: customFilter,
      },
      inputs.request,
    );

    return customFilter;
  },
};
