/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import socket from './socket';

/* Actions */

const createCustomFilter = (boardId, data, headers) =>
  socket.post(`/boards/${boardId}/custom-filters`, data, headers);

const updateCustomFilter = (id, data, headers) =>
  socket.patch(`/custom-filters/${id}`, data, headers);

const deleteCustomFilter = (id, headers) =>
  socket.delete(`/custom-filters/${id}`, undefined, headers);

export default {
  createCustomFilter,
  updateCustomFilter,
  deleteCustomFilter,
};
