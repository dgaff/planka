/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import React, { useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button } from 'semantic-ui-react';
import { Input } from '../../../../lib/custom-ui';

import selectors from '../../../../selectors';
import { useNestedRef } from '../../../../hooks';
import LABEL_COLORS from '../../../../constants/LabelColors';
import LabelChip from '../../../labels/LabelChip';

import styles from './Editor.module.scss';
import globalStyles from '../../../../styles.module.scss';

const Editor = React.memo(({ data, setData }) => {
  const [t] = useTranslation();

  const labels = useSelector(selectors.selectLabelsForCurrentBoard);

  const [nameFieldRef, handleNameFieldRef] = useNestedRef('inputRef');

  const labelsById = useMemo(() => {
    const result = {};
    labels.forEach((label) => {
      result[label.id] = label;
    });
    return result;
  }, [labels]);

  const handleNameChange = useCallback(
    (_, { value }) => {
      setData((prevData) => ({
        ...prevData,
        name: value,
      }));
    },
    [setData],
  );

  const handleColorClick = useCallback(
    (_, { value }) => {
      setData((prevData) => ({
        ...prevData,
        color: value,
        isColorSet: true,
      }));
    },
    [setData],
  );

  const handleLabelClick = useCallback(
    ({
      currentTarget: {
        dataset: { id: labelId },
      },
    }) => {
      setData((prevData) => {
        const isSelected = prevData.labelIds.includes(labelId);

        const nextLabelIds = isSelected
          ? prevData.labelIds.filter((id) => id !== labelId)
          : [...prevData.labelIds, labelId];

        let nextColor = prevData.color;
        if (!prevData.isColorSet) {
          const firstLabel = nextLabelIds.length > 0 && labelsById[nextLabelIds[0]];
          if (firstLabel) {
            nextColor = firstLabel.color;
          }
        }

        return {
          ...prevData,
          labelIds: nextLabelIds,
          color: nextColor,
        };
      });
    },
    [setData, labelsById],
  );

  useEffect(() => {
    nameFieldRef.current.focus();
  }, [nameFieldRef]);

  return (
    <>
      <div className={styles.text}>{t('common.title')}</div>
      <Input
        fluid
        ref={handleNameFieldRef}
        value={data.name}
        maxLength={128}
        className={styles.field}
        onChange={handleNameChange}
      />
      <div className={styles.text}>{t('common.labels')}</div>
      <div className={styles.hint}>{t('common.selectLabelsForThisFilter')}</div>
      <div className={styles.labels}>
        {labels.map((label) => (
          <button
            key={label.id}
            type="button"
            data-id={label.id}
            className={classNames(
              styles.labelButton,
              !data.labelIds.includes(label.id) && styles.labelButtonInactive,
            )}
            onClick={handleLabelClick}
          >
            <LabelChip id={label.id} size="small" />
          </button>
        ))}
      </div>
      <div className={styles.text}>{t('common.color')}</div>
      <div className={styles.colorButtons}>
        {LABEL_COLORS.map((color) => (
          <Button
            key={color}
            type="button"
            value={color}
            className={classNames(
              styles.colorButton,
              color === data.color && styles.colorButtonActive,
              globalStyles[`background${upperFirst(camelCase(color))}`],
            )}
            onClick={handleColorClick}
          />
        ))}
      </div>
    </>
  );
});

Editor.propTypes = {
  data: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  setData: PropTypes.func.isRequired,
};

export default Editor;
