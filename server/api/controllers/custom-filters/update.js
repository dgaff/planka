/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /custom-filters/{id}:
 *   patch:
 *     summary: Update custom filter
 *     description: Updates a custom filter. Requires board editor permissions.
 *     tags:
 *       - Custom Filters
 *     operationId: updateCustomFilter
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the custom filter to update
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               position:
 *                 type: number
 *                 minimum: 0
 *                 description: Position of the custom filter within the board toolbar
 *                 example: 65536
 *               name:
 *                 type: string
 *                 maxLength: 128
 *                 description: Name/title of the custom filter
 *                 example: My cards
 *               color:
 *                 type: string
 *                 description: Color of the custom filter button
 *                 example: berry-red
 *               labelIds:
 *                 type: array
 *                 description: IDs of the labels the filter matches
 *                 items:
 *                   type: string
 *                 example: ["1357158568008091266"]
 *     responses:
 *       200:
 *         description: Custom filter updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/CustomFilter'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  CUSTOM_FILTER_NOT_FOUND: {
    customFilterNotFound: 'Custom filter not found',
  },
};

module.exports = {
  inputs: {
    id: {
      ...idInput,
      required: true,
    },
    position: {
      type: 'number',
      min: 0,
    },
    name: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 128,
    },
    color: {
      type: 'string',
      isIn: Label.COLORS,
    },
    labelIds: {
      type: 'json',
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    customFilterNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const pathToProject = await sails.helpers.customFilters
      .getPathToProjectById(inputs.id)
      .intercept('pathNotFound', () => Errors.CUSTOM_FILTER_NOT_FOUND);

    let { customFilter } = pathToProject;
    const { board } = pathToProject;

    const boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
      board.id,
      currentUser.id,
    );

    if (!boardMembership) {
      throw Errors.CUSTOM_FILTER_NOT_FOUND; // Forbidden
    }

    if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const values = _.pick(inputs, ['position', 'name', 'color', 'labelIds']);

    customFilter = await sails.helpers.customFilters.updateOne.with({
      values,
      record: customFilter,
      actorUser: currentUser,
      request: this.req,
    });

    if (!customFilter) {
      throw Errors.CUSTOM_FILTER_NOT_FOUND;
    }

    return {
      item: customFilter,
    };
  },
};
