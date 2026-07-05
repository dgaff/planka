/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /boards/{id}/import:
 *   post:
 *     summary: Import into board
 *     description: Imports the contents of a previously exported board (ZIP archive) into an existing board. The import is additive - it only creates new lists, labels, cards and related data and never removes or overwrites existing content. Requires editor rights on the board.
 *     tags:
 *       - Boards
 *     operationId: importIntoBoard
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the board to import into
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - importFile
 *             properties:
 *               importFile:
 *                 type: string
 *                 format: binary
 *                 description: Exported board archive (.zip)
 *               requestId:
 *                 type: string
 *                 maxLength: 128
 *                 description: Request ID for tracking
 *                 example: req_123456
 *     responses:
 *       200:
 *         description: Board imported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/Board'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       422:
 *         description: Import file upload error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - code
 *                 - message
 *               properties:
 *                 code:
 *                   type: string
 *                   example: E_UNPROCESSABLE_ENTITY
 *                 message:
 *                   type: string
 *                   example: Invalid import file
 */

const fs = require('fs').promises;
const AdmZip = require('adm-zip');

const { idInput } = require('../../../utils/inputs');

const Errors = {
  BOARD_NOT_FOUND: {
    boardNotFound: 'Board not found',
  },
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  NO_IMPORT_FILE_WAS_UPLOADED: {
    noImportFileWasUploaded: 'No import file was uploaded',
  },
  INVALID_IMPORT_FILE: {
    invalidImportFile: 'Invalid import file',
  },
};

module.exports = {
  inputs: {
    id: {
      ...idInput,
      required: true,
    },
    requestId: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 128,
    },
  },

  exits: {
    boardNotFound: {
      responseType: 'notFound',
    },
    notEnoughRights: {
      responseType: 'forbidden',
    },
    noImportFileWasUploaded: {
      responseType: 'unprocessableEntity',
    },
    invalidImportFile: {
      responseType: 'unprocessableEntity',
    },
    uploadError: {
      responseType: 'unprocessableEntity',
    },
  },

  async fn(inputs, exits) {
    const { currentUser } = this.req;

    const { board, project } = await sails.helpers.boards
      .getPathToProjectById(inputs.id)
      .intercept('pathNotFound', () => Errors.BOARD_NOT_FOUND);

    const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, project.id);

    if (!isProjectManager) {
      const boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
        board.id,
        currentUser.id,
      );

      if (!boardMembership) {
        throw Errors.BOARD_NOT_FOUND; // Forbidden
      }

      if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
        throw Errors.NOT_ENOUGH_RIGHTS;
      }
    }

    let files;
    try {
      files = await sails.helpers.utils.receiveFile(this.req.file('importFile'), false);
    } catch (error) {
      return exits.uploadError(error.message);
    }

    if (files.length === 0) {
      throw Errors.NO_IMPORT_FILE_WAS_UPLOADED;
    }

    const file = _.last(files);

    try {
      let zip;
      let exportData;

      try {
        zip = new AdmZip(file.fd);
        const boardJsonEntry = zip.getEntry('board.json');

        if (!boardJsonEntry) {
          throw new Error('Missing board.json');
        }

        exportData = JSON.parse(zip.readAsText(boardJsonEntry));
      } catch (error) {
        throw Errors.INVALID_IMPORT_FILE;
      }

      if (!exportData || exportData.formatVersion !== 1) {
        throw Errors.INVALID_IMPORT_FILE;
      }

      // Collect bundled attachment files: attachments/<attachmentId>/<filename>
      const attachmentFiles = new Map();
      zip.getEntries().forEach((entry) => {
        if (entry.isDirectory) {
          return;
        }

        const match = entry.entryName.match(/^attachments\/([^/]+)\/(.+)$/);
        if (!match) {
          return;
        }

        attachmentFiles.set(match[1], {
          filename: match[2],
          buffer: entry.getData(),
        });
      });

      await sails.helpers.boards.importIntoBoard.with({
        board,
        exportData,
        attachmentFiles,
        actorUser: currentUser,
      });
    } finally {
      await fs.rm(file.fd, { force: true }).catch(() => {});
    }

    return exits.success({
      item: board,
    });
  },
};
