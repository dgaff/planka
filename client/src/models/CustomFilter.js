/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { attr, fk } from 'redux-orm';

import BaseModel from './BaseModel';
import ActionTypes from '../constants/ActionTypes';

export default class extends BaseModel {
  static modelName = 'CustomFilter';

  static fields = {
    id: attr(),
    position: attr(),
    name: attr(),
    color: attr(),
    labelIds: attr({
      getDefault: () => [],
    }),
    boardId: fk({
      to: 'Board',
      as: 'board',
      relatedName: 'customFilters',
    }),
  };

  static reducer({ type, payload }, CustomFilter) {
    switch (type) {
      case ActionTypes.LOCATION_CHANGE_HANDLE:
      case ActionTypes.CORE_INITIALIZE:
      case ActionTypes.BOARD_FETCH__SUCCESS:
        if (payload.customFilters) {
          payload.customFilters.forEach((customFilter) => {
            CustomFilter.upsert(customFilter);
          });
        }

        break;
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        CustomFilter.all().delete();

        if (payload.customFilters) {
          payload.customFilters.forEach((customFilter) => {
            CustomFilter.upsert(customFilter);
          });
        }

        break;
      case ActionTypes.CUSTOM_FILTER_CREATE:
      case ActionTypes.CUSTOM_FILTER_CREATE_HANDLE:
      case ActionTypes.CUSTOM_FILTER_UPDATE__SUCCESS:
      case ActionTypes.CUSTOM_FILTER_UPDATE_HANDLE:
        CustomFilter.upsert(payload.customFilter);

        break;
      case ActionTypes.CUSTOM_FILTER_CREATE__SUCCESS:
        CustomFilter.withId(payload.localId).delete();
        CustomFilter.upsert(payload.customFilter);

        break;
      case ActionTypes.CUSTOM_FILTER_CREATE__FAILURE:
        CustomFilter.withId(payload.localId).delete();

        break;
      case ActionTypes.CUSTOM_FILTER_UPDATE:
        CustomFilter.withId(payload.id).update(payload.data);

        break;
      case ActionTypes.CUSTOM_FILTER_DELETE:
        CustomFilter.withId(payload.id).delete();

        break;
      case ActionTypes.CUSTOM_FILTER_DELETE__SUCCESS:
      case ActionTypes.CUSTOM_FILTER_DELETE_HANDLE: {
        const customFilterModel = CustomFilter.withId(payload.customFilter.id);

        if (customFilterModel) {
          customFilterModel.delete();
        }

        break;
      }
      default:
    }
  }
}
