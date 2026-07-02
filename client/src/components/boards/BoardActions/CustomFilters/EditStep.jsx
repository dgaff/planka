/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { dequal } from 'dequal';
import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Form } from 'semantic-ui-react';
import { Popup } from '../../../../lib/custom-ui';

import selectors from '../../../../selectors';
import entryActions from '../../../../entry-actions';
import { useForm, useSteps } from '../../../../hooks';
import Editor from './Editor';
import ConfirmationStep from '../../../common/ConfirmationStep';

import styles from './EditStep.module.scss';

const StepTypes = {
  DELETE: 'DELETE',
};

const EditStep = React.memo(({ customFilterId, onBack }) => {
  const selectCustomFilterById = useMemo(() => selectors.makeSelectCustomFilterById(), []);

  const customFilter = useSelector((state) => selectCustomFilterById(state, customFilterId));

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const defaultData = useMemo(
    () => ({
      name: customFilter.name,
      color: customFilter.color,
      labelIds: customFilter.labelIds || [],
    }),
    [customFilter.name, customFilter.color, customFilter.labelIds],
  );

  const [data, , setData] = useForm(() => ({
    ...defaultData,
    isColorSet: true,
  }));

  const [step, openStep, handleBack] = useSteps();

  const handleSubmit = useCallback(() => {
    const cleanName = data.name.trim();

    if (!cleanName) {
      return;
    }

    const cleanData = {
      name: cleanName,
      color: data.color,
      labelIds: data.labelIds,
    };

    if (!dequal(cleanData, defaultData)) {
      dispatch(entryActions.updateCustomFilter(customFilterId, cleanData));
    }

    onBack();
  }, [customFilterId, onBack, defaultData, dispatch, data]);

  const handleDeleteConfirm = useCallback(() => {
    dispatch(entryActions.deleteCustomFilter(customFilterId));
  }, [customFilterId, dispatch]);

  const handleDeleteClick = useCallback(() => {
    openStep(StepTypes.DELETE);
  }, [openStep]);

  if (step && step.type === StepTypes.DELETE) {
    return (
      <ConfirmationStep
        title="common.deleteCustomFilter"
        content="common.areYouSureYouWantToDeleteThisCustomFilter"
        buttonContent="action.deleteCustomFilter"
        onConfirm={handleDeleteConfirm}
        onBack={handleBack}
      />
    );
  }

  return (
    <>
      <Popup.Header onBack={onBack}>
        {t('common.editCustomFilter', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <Form onSubmit={handleSubmit}>
          <Editor data={data} setData={setData} />
          <div className={styles.actions}>
            <Button positive content={t('action.save')} />
            <Button
              type="button"
              content={t('action.delete')}
              className={styles.deleteButton}
              onClick={handleDeleteClick}
            />
          </div>
        </Form>
      </Popup.Content>
    </>
  );
});

EditStep.propTypes = {
  customFilterId: PropTypes.string.isRequired,
  onBack: PropTypes.func.isRequired,
};

export default EditStep;
