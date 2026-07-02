/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import EntryActionTypes from '../constants/EntryActionTypes';

const createCustomFilterInCurrentBoard = (data) => ({
  type: EntryActionTypes.CUSTOM_FILTER_IN_CURRENT_BOARD_CREATE,
  payload: {
    data,
  },
});

const handleCustomFilterCreate = (customFilter) => ({
  type: EntryActionTypes.CUSTOM_FILTER_CREATE_HANDLE,
  payload: {
    customFilter,
  },
});

const updateCustomFilter = (id, data) => ({
  type: EntryActionTypes.CUSTOM_FILTER_UPDATE,
  payload: {
    id,
    data,
  },
});

const handleCustomFilterUpdate = (customFilter) => ({
  type: EntryActionTypes.CUSTOM_FILTER_UPDATE_HANDLE,
  payload: {
    customFilter,
  },
});

const moveCustomFilter = (id, index) => ({
  type: EntryActionTypes.CUSTOM_FILTER_MOVE,
  payload: {
    id,
    index,
  },
});

const deleteCustomFilter = (id) => ({
  type: EntryActionTypes.CUSTOM_FILTER_DELETE,
  payload: {
    id,
  },
});

const handleCustomFilterDelete = (customFilter) => ({
  type: EntryActionTypes.CUSTOM_FILTER_DELETE_HANDLE,
  payload: {
    customFilter,
  },
});

const activateCustomFilterInCurrentBoard = (id) => ({
  type: EntryActionTypes.CUSTOM_FILTER_IN_CURRENT_BOARD_ACTIVATE,
  payload: {
    id,
  },
});

export default {
  createCustomFilterInCurrentBoard,
  handleCustomFilterCreate,
  updateCustomFilter,
  handleCustomFilterUpdate,
  moveCustomFilter,
  deleteCustomFilter,
  handleCustomFilterDelete,
  activateCustomFilterInCurrentBoard,
};
