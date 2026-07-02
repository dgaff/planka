/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button } from 'semantic-ui-react';
import { Popup } from '../../../../lib/custom-ui';

import selectors from '../../../../selectors';
import { useSteps } from '../../../../hooks';
import AddStep from './AddStep';
import EditStep from './EditStep';

import styles from './CustomFiltersStep.module.scss';
import globalStyles from '../../../../styles.module.scss';

const StepTypes = {
  ADD: 'ADD',
  EDIT: 'EDIT',
};

const CustomFiltersStep = React.memo(({ onBack }) => {
  const customFilters = useSelector(selectors.selectCustomFiltersForCurrentBoard);

  const [t] = useTranslation();
  const [step, openStep, handleBack] = useSteps();

  const handleAddClick = useCallback(() => {
    openStep(StepTypes.ADD);
  }, [openStep]);

  const handleEditClick = useCallback(
    ({
      currentTarget: {
        dataset: { id },
      },
    }) => {
      openStep(StepTypes.EDIT, {
        id,
      });
    },
    [openStep],
  );

  if (step) {
    switch (step.type) {
      case StepTypes.ADD:
        return <AddStep onBack={handleBack} />;
      case StepTypes.EDIT: {
        const currentCustomFilter = customFilters.find(
          (customFilter) => customFilter.id === step.params.id,
        );

        if (currentCustomFilter) {
          return <EditStep customFilterId={currentCustomFilter.id} onBack={handleBack} />;
        }

        openStep(null);

        break;
      }
      default:
    }
  }

  return (
    <>
      <Popup.Header onBack={onBack}>
        {t('common.customFilters', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        {customFilters.length > 0 ? (
          <div className={styles.items}>
            {customFilters.map((customFilter) => (
              <div key={customFilter.id} className={styles.item}>
                <span
                  className={classNames(
                    styles.name,
                    globalStyles[`background${upperFirst(camelCase(customFilter.color))}`],
                  )}
                >
                  {customFilter.name}
                </span>
                <Button
                  icon="pencil"
                  size="small"
                  data-id={customFilter.id}
                  className={styles.editButton}
                  onClick={handleEditClick}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.hint}>{t('common.noCustomFiltersYet')}</div>
        )}
        <Button
          fluid
          content={t('action.createNewCustomFilter')}
          className={styles.addButton}
          onClick={handleAddClick}
        />
      </Popup.Content>
    </>
  );
});

CustomFiltersStep.propTypes = {
  onBack: PropTypes.func,
};

CustomFiltersStep.defaultProps = {
  onBack: undefined,
};

export default CustomFiltersStep;
