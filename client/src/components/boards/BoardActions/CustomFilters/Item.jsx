/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import React, { useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { Draggable } from 'react-beautiful-dnd';

import selectors from '../../../../selectors';

import styles from './Item.module.scss';
import globalStyles from '../../../../styles.module.scss';

const Item = React.memo(({ id, index, isActive, canEdit, onToggle }) => {
  const selectCustomFilterById = useMemo(() => selectors.makeSelectCustomFilterById(), []);

  const customFilter = useSelector((state) => selectCustomFilterById(state, id));

  const handleClick = useCallback(() => {
    if (customFilter.isPersisted) {
      onToggle(id);
    }
  }, [id, customFilter.isPersisted, onToggle]);

  return (
    <Draggable
      draggableId={id}
      index={index}
      isDragDisabled={!customFilter.isPersisted || !canEdit}
    >
      {({ innerRef, draggableProps, dragHandleProps }, { isDragging }) => {
        const contentNode = (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <div {...draggableProps} {...dragHandleProps} ref={innerRef} className={styles.wrapper}>
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,
                                         jsx-a11y/no-static-element-interactions */}
            <span
              className={classNames(
                styles.button,
                isActive && styles.buttonActive,
                globalStyles[`background${upperFirst(camelCase(customFilter.color))}`],
              )}
              onClick={handleClick}
            >
              {customFilter.name}
            </span>
          </div>
        );

        return isDragging ? ReactDOM.createPortal(contentNode, document.body) : contentNode;
      }}
    </Draggable>
  );
});

Item.propTypes = {
  id: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  isActive: PropTypes.bool.isRequired,
  canEdit: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};

export default Item;
