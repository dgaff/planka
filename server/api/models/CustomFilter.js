/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * CustomFilter.js
 *
 * @description :: A named, colored, reusable set of labels used to filter cards on a board.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CustomFilter:
 *       type: object
 *       required:
 *         - id
 *         - boardId
 *         - position
 *         - name
 *         - color
 *         - labelIds
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the custom filter
 *           example: "1357158568008091264"
 *         boardId:
 *           type: string
 *           description: ID of the board the custom filter belongs to
 *           example: "1357158568008091265"
 *         position:
 *           type: number
 *           description: Position of the custom filter within the board toolbar
 *           example: 65536
 *         name:
 *           type: string
 *           description: Name/title of the custom filter
 *           example: My cards
 *         color:
 *           type: string
 *           description: Color of the custom filter button
 *           example: berry-red
 *         labelIds:
 *           type: array
 *           description: IDs of the labels the filter matches (a card must have all of them)
 *           items:
 *             type: string
 *           example: ["1357158568008091266", "1357158568008091267"]
 *         createdAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the custom filter was created
 *           example: 2024-01-01T00:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the custom filter was last updated
 *           example: 2024-01-01T00:00:00.000Z
 */

// The global `Label` model is not yet available while model files are being
// loaded, so reference its exported color list directly.
const { COLORS } = require('./Label');

module.exports = {
  tableName: 'custom_filter',

  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    position: {
      type: 'number',
      required: true,
    },
    name: {
      type: 'string',
      isNotEmptyString: true,
      required: true,
    },
    color: {
      type: 'string',
      isIn: COLORS,
      required: true,
    },
    labelIds: {
      type: 'json',
      columnName: 'label_ids',
      defaultsTo: [],
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

    boardId: {
      model: 'Board',
      required: true,
      columnName: 'board_id',
    },
  },
};
