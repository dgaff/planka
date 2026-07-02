/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    id: {
      type: 'string',
      required: true,
    },
  },

  exits: {
    pathNotFound: {},
  },

  async fn(inputs) {
    const customFilter = await CustomFilter.qm.getOneById(inputs.id);

    if (!customFilter) {
      throw 'pathNotFound';
    }

    const pathToProject = await sails.helpers.boards
      .getPathToProjectById(customFilter.boardId)
      .intercept('pathNotFound', (nodes) => ({
        pathNotFound: {
          customFilter,
          ...nodes,
        },
      }));

    return {
      customFilter,
      ...pathToProject,
    };
  },
};
