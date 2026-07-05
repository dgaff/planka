/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import http from './http';
import socket from './socket';
import Config from '../constants/Config';
import { transformCard } from './cards';
import { transformAttachment } from './attachments';

/* Actions */

const createBoard = (projectId, data, headers) =>
  socket.post(`/projects/${projectId}/boards`, data, headers);

const createBoardWithImport = (projectId, data, requestId, headers) =>
  http.post(`/projects/${projectId}/boards?requestId=${requestId}`, data, headers);

const parseFilename = (contentDisposition, fallback) => {
  if (contentDisposition) {
    const match = /filename="?([^"]+)"?/.exec(contentDisposition);
    if (match) {
      return match[1];
    }
  }

  return fallback;
};

const exportBoard = (id, headers) =>
  fetch(`${Config.BASE_PATH}/api/boards/${id}/export`, {
    method: 'GET',
    headers,
    credentials: 'include',
  }).then((response) => {
    if (response.status !== 200) {
      return response.json().then((body) => {
        throw body;
      });
    }

    return response.blob().then((blob) => ({
      blob,
      filename: parseFilename(response.headers.get('Content-Disposition'), `board-${id}.zip`),
    }));
  });

const importBoard = (id, file, requestId, headers) =>
  http.post(`/boards/${id}/import?requestId=${requestId}`, { importFile: file }, headers);

const getBoard = (id, subscribe, headers) =>
  socket
    .get(`/boards/${id}${subscribe ? '?subscribe=true' : ''}`, undefined, headers)
    .then((body) => ({
      ...body,
      included: {
        ...body.included,
        cards: body.included.cards.map(transformCard),
        attachments: body.included.attachments.map(transformAttachment),
      },
    }));

const updateBoard = (id, data, headers) => socket.patch(`/boards/${id}`, data, headers);

const deleteBoard = (id, headers) => socket.delete(`/boards/${id}`, undefined, headers);

export default {
  createBoard,
  createBoardWithImport,
  exportBoard,
  importBoard,
  getBoard,
  updateBoard,
  deleteBoard,
};
