/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { createSelector } from 'redux-orm';

import orm from '../orm';
import { isLocalId } from '../utils/local-id';

export const makeSelectCustomFilterById = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ CustomFilter }, id) => {
      const customFilterModel = CustomFilter.withId(id);

      if (!customFilterModel) {
        return customFilterModel;
      }

      return {
        ...customFilterModel.ref,
        isPersisted: !isLocalId(customFilterModel.id),
      };
    },
  );

export const selectCustomFilterById = makeSelectCustomFilterById();

export default {
  makeSelectCustomFilterById,
  selectCustomFilterById,
};
