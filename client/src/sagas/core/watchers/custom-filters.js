/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { all, takeEvery } from 'redux-saga/effects';

import services from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* customFiltersWatchers() {
  yield all([
    takeEvery(EntryActionTypes.CUSTOM_FILTER_IN_CURRENT_BOARD_CREATE, ({ payload: { data } }) =>
      services.createCustomFilterInCurrentBoard(data),
    ),
    takeEvery(EntryActionTypes.CUSTOM_FILTER_CREATE_HANDLE, ({ payload: { customFilter } }) =>
      services.handleCustomFilterCreate(customFilter),
    ),
    takeEvery(EntryActionTypes.CUSTOM_FILTER_UPDATE, ({ payload: { id, data } }) =>
      services.updateCustomFilter(id, data),
    ),
    takeEvery(EntryActionTypes.CUSTOM_FILTER_UPDATE_HANDLE, ({ payload: { customFilter } }) =>
      services.handleCustomFilterUpdate(customFilter),
    ),
    takeEvery(EntryActionTypes.CUSTOM_FILTER_MOVE, ({ payload: { id, index } }) =>
      services.moveCustomFilter(id, index),
    ),
    takeEvery(EntryActionTypes.CUSTOM_FILTER_DELETE, ({ payload: { id } }) =>
      services.deleteCustomFilter(id),
    ),
    takeEvery(EntryActionTypes.CUSTOM_FILTER_DELETE_HANDLE, ({ payload: { customFilter } }) =>
      services.handleCustomFilterDelete(customFilter),
    ),
    takeEvery(EntryActionTypes.CUSTOM_FILTER_IN_CURRENT_BOARD_ACTIVATE, ({ payload: { id } }) =>
      services.activateCustomFilterInCurrentBoard(id),
    ),
  ]);
}
