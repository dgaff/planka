/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

const createCustomFilter = (customFilter) => ({
  type: ActionTypes.CUSTOM_FILTER_CREATE,
  payload: {
    customFilter,
  },
});

createCustomFilter.success = (localId, customFilter) => ({
  type: ActionTypes.CUSTOM_FILTER_CREATE__SUCCESS,
  payload: {
    localId,
    customFilter,
  },
});

createCustomFilter.failure = (localId, error) => ({
  type: ActionTypes.CUSTOM_FILTER_CREATE__FAILURE,
  payload: {
    localId,
    error,
  },
});

const handleCustomFilterCreate = (customFilter) => ({
  type: ActionTypes.CUSTOM_FILTER_CREATE_HANDLE,
  payload: {
    customFilter,
  },
});

const updateCustomFilter = (id, data) => ({
  type: ActionTypes.CUSTOM_FILTER_UPDATE,
  payload: {
    id,
    data,
  },
});

updateCustomFilter.success = (customFilter) => ({
  type: ActionTypes.CUSTOM_FILTER_UPDATE__SUCCESS,
  payload: {
    customFilter,
  },
});

updateCustomFilter.failure = (id, error) => ({
  type: ActionTypes.CUSTOM_FILTER_UPDATE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleCustomFilterUpdate = (customFilter) => ({
  type: ActionTypes.CUSTOM_FILTER_UPDATE_HANDLE,
  payload: {
    customFilter,
  },
});

const deleteCustomFilter = (id) => ({
  type: ActionTypes.CUSTOM_FILTER_DELETE,
  payload: {
    id,
  },
});

deleteCustomFilter.success = (customFilter) => ({
  type: ActionTypes.CUSTOM_FILTER_DELETE__SUCCESS,
  payload: {
    customFilter,
  },
});

deleteCustomFilter.failure = (id, error) => ({
  type: ActionTypes.CUSTOM_FILTER_DELETE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleCustomFilterDelete = (customFilter) => ({
  type: ActionTypes.CUSTOM_FILTER_DELETE_HANDLE,
  payload: {
    customFilter,
  },
});

const activateCustomFilterInBoard = (id, boardId) => ({
  type: ActionTypes.CUSTOM_FILTER_IN_BOARD_ACTIVATE,
  payload: {
    id,
    boardId,
  },
});

const deactivateCustomFilterInBoard = (boardId) => ({
  type: ActionTypes.CUSTOM_FILTER_IN_BOARD_DEACTIVATE,
  payload: {
    boardId,
  },
});

export default {
  createCustomFilter,
  handleCustomFilterCreate,
  updateCustomFilter,
  handleCustomFilterUpdate,
  deleteCustomFilter,
  handleCustomFilterDelete,
  activateCustomFilterInBoard,
  deactivateCustomFilterInBoard,
};
