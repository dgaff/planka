/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /boards/{id}/export:
 *   get:
 *     summary: Export board
 *     description: Exports a board and all of its content (lists, labels, cards, tasks, custom fields, comments and attachments) as a downloadable ZIP archive. Requires access to the board.
 *     tags:
 *       - Boards
 *     operationId: exportBoard
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the board to export
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *     responses:
 *       200:
 *         description: Board exported successfully
 *         content:
 *           application/zip:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

const { Readable } = require('stream');
const AdmZip = require('adm-zip');

const { idInput } = require('../../../utils/inputs');

const Errors = {
  BOARD_NOT_FOUND: {
    boardNotFound: 'Board not found',
  },
};

const streamToBuffer = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];

    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });

const sanitizeFilename = (name) => (name || 'board').replace(/[^a-z0-9\-_]+/gi, '_').slice(0, 64);

module.exports = {
  inputs: {
    id: {
      ...idInput,
      required: true,
    },
  },

  exits: {
    boardNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs, exits) {
    const { currentUser } = this.req;

    const { board, project } = await sails.helpers.boards
      .getPathToProjectById(inputs.id)
      .intercept('pathNotFound', () => Errors.BOARD_NOT_FOUND);

    if (currentUser.role !== User.Roles.ADMIN || project.ownerProjectManagerId) {
      const isProjectManager = await sails.helpers.users.isProjectManager(
        currentUser.id,
        project.id,
      );

      if (!isProjectManager) {
        const boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
          board.id,
          currentUser.id,
        );

        if (!boardMembership) {
          throw Errors.BOARD_NOT_FOUND; // Forbidden
        }
      }
    }

    const { exportData, fileAttachments } = await sails.helpers.boards.getForExport.with({
      board,
    });

    const zip = new AdmZip();
    zip.addFile('board.json', Buffer.from(JSON.stringify(exportData, null, 2), 'utf8'));

    const fileManager = sails.hooks['file-manager'].getInstance();

    await Promise.all(
      fileAttachments.map(async (fileAttachment) => {
        let readStream;
        try {
          readStream = await fileManager.read(
            `${sails.config.custom.attachmentsPathSegment}/${fileAttachment.uploadedFileId}/${fileAttachment.filename}`,
          );
        } catch (error) {
          // Missing file on disk shouldn't abort the whole export.
          sails.log.warn(`Skipping missing attachment file: ${fileAttachment.attachmentId}`);
          return;
        }

        const buffer = await streamToBuffer(readStream);

        zip.addFile(
          `attachments/${fileAttachment.attachmentId}/${fileAttachment.filename}`,
          buffer,
        );
      }),
    );

    const zipBuffer = zip.toBuffer();

    this.res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${sanitizeFilename(board.name)}.planka.zip"`,
      'Content-Length': zipBuffer.length,
      'Cache-Control': 'private, no-store',
    });

    return exits.success(Readable.from(zipBuffer));
  },
};
