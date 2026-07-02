/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { Icon } from 'semantic-ui-react';

import selectors from '../../../../selectors';
import entryActions from '../../../../entry-actions';
import { usePopup } from '../../../../lib/popup';
import DroppableTypes from '../../../../constants/DroppableTypes';
import { BoardMembershipRoles } from '../../../../constants/Enums';
import Item from './Item';
import CustomFiltersStep from './CustomFiltersStep';

import styles from './CustomFilters.module.scss';
import globalStyles from '../../../../styles.module.scss';

const CustomFilters = React.memo(() => {
  const customFilters = useSelector(selectors.selectCustomFiltersForCurrentBoard);
  const activeCustomFilterId = useSelector(selectors.selectActiveCustomFilterIdForCurrentBoard);

  const canEdit = useSelector((state) => {
    const boardMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);
    return !!boardMembership && boardMembership.role === BoardMembershipRoles.EDITOR;
  });

  const dispatch = useDispatch();

  const handleToggle = useCallback(
    (id) => {
      dispatch(entryActions.activateCustomFilterInCurrentBoard(id));
    },
    [dispatch],
  );

  const handleDragStart = useCallback(() => {
    document.body.classList.add(globalStyles.dragging);
  }, []);

  const handleDragEnd = useCallback(
    ({ draggableId, source, destination }) => {
      document.body.classList.remove(globalStyles.dragging);

      if (!destination || source.index === destination.index) {
        return;
      }

      dispatch(entryActions.moveCustomFilter(draggableId, destination.index));
    },
    [dispatch],
  );

  const CustomFiltersPopup = usePopup(CustomFiltersStep);

  if (customFilters.length === 0 && !canEdit) {
    return null;
  }

  return (
    <span className={styles.wrapper}>
      <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <Droppable
          droppableId="customFilters"
          type={DroppableTypes.CUSTOM_FILTER}
          direction="horizontal"
        >
          {({ innerRef, droppableProps, placeholder }) => (
            <div
              {...droppableProps} // eslint-disable-line react/jsx-props-no-spreading
              ref={innerRef}
              className={styles.items}
            >
              {customFilters.map((customFilter, index) => (
                <Item
                  key={customFilter.id}
                  id={customFilter.id}
                  index={index}
                  isActive={customFilter.id === activeCustomFilterId}
                  canEdit={canEdit}
                  onToggle={handleToggle}
                />
              ))}
              {placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      {canEdit && (
        <CustomFiltersPopup>
          <button type="button" className={styles.manageButton}>
            <Icon fitted name="plus" />
          </button>
        </CustomFiltersPopup>
      )}
    </span>
  );
});

export default CustomFilters;
