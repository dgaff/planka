/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { call, put, select } from 'redux-saga/effects';

import request from '../request';
import selectors from '../../../selectors';
import actions from '../../../actions';
import api from '../../../api';
import { createLocalId } from '../../../utils/local-id';

export function* createCustomFilter(boardId, data) {
  const localId = yield call(createLocalId);

  const nextData = {
    ...data,
    position: yield select(selectors.selectNextCustomFilterPosition, boardId),
  };

  yield put(
    actions.createCustomFilter({
      ...nextData,
      boardId,
      id: localId,
    }),
  );

  let customFilter;
  try {
    ({ item: customFilter } = yield call(request, api.createCustomFilter, boardId, nextData));
  } catch (error) {
    yield put(actions.createCustomFilter.failure(localId, error));
    return;
  }

  yield put(actions.createCustomFilter.success(localId, customFilter));
}

export function* createCustomFilterInCurrentBoard(data) {
  const { boardId } = yield select(selectors.selectPath);

  yield call(createCustomFilter, boardId, data);
}

export function* handleCustomFilterCreate(customFilter) {
  yield put(actions.handleCustomFilterCreate(customFilter));
}

export function* updateCustomFilter(id, data) {
  yield put(actions.updateCustomFilter(id, data));

  let customFilter;
  try {
    ({ item: customFilter } = yield call(request, api.updateCustomFilter, id, data));
  } catch (error) {
    yield put(actions.updateCustomFilter.failure(id, error));
    return;
  }

  yield put(actions.updateCustomFilter.success(customFilter));
}

export function* handleCustomFilterUpdate(customFilter) {
  yield put(actions.handleCustomFilterUpdate(customFilter));
}

export function* moveCustomFilter(id, index) {
  const { boardId } = yield select(selectors.selectCustomFilterById, id);
  const position = yield select(selectors.selectNextCustomFilterPosition, boardId, index, id);

  yield call(updateCustomFilter, id, {
    position,
  });
}

export function* deleteCustomFilter(id) {
  const { boardId } = yield select(selectors.selectCustomFilterById, id);
  const activeId = yield select(selectors.selectActiveCustomFilterIdForCurrentBoard);

  if (activeId === id) {
    yield put(actions.deactivateCustomFilterInBoard(boardId));
  }

  yield put(actions.deleteCustomFilter(id));

  let customFilter;
  try {
    ({ item: customFilter } = yield call(request, api.deleteCustomFilter, id));
  } catch (error) {
    yield put(actions.deleteCustomFilter.failure(id, error));
    return;
  }

  yield put(actions.deleteCustomFilter.success(customFilter));
}

export function* handleCustomFilterDelete(customFilter) {
  yield put(actions.handleCustomFilterDelete(customFilter));
}

export function* activateCustomFilterInCurrentBoard(id) {
  const { boardId } = yield select(selectors.selectPath);
  const activeId = yield select(selectors.selectActiveCustomFilterIdForCurrentBoard);

  if (activeId === id) {
    yield put(actions.deactivateCustomFilterInBoard(boardId));
  } else {
    yield put(actions.activateCustomFilterInBoard(id, boardId));
  }
}

export default {
  createCustomFilter,
  createCustomFilterInCurrentBoard,
  handleCustomFilterCreate,
  updateCustomFilter,
  handleCustomFilterUpdate,
  moveCustomFilter,
  deleteCustomFilter,
  handleCustomFilterDelete,
  activateCustomFilterInCurrentBoard,
};
