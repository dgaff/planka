/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Form } from 'semantic-ui-react';
import { Popup } from '../../../../lib/custom-ui';

import entryActions from '../../../../entry-actions';
import { useForm } from '../../../../hooks';
import LABEL_COLORS from '../../../../constants/LabelColors';
import Editor from './Editor';

const AddStep = React.memo(({ onBack }) => {
  const dispatch = useDispatch();
  const [t] = useTranslation();

  const [data, , setData] = useForm(() => ({
    name: '',
    color: LABEL_COLORS[0],
    labelIds: [],
    isColorSet: false,
  }));

  const handleSubmit = useCallback(() => {
    const cleanName = data.name.trim();

    if (!cleanName) {
      return;
    }

    dispatch(
      entryActions.createCustomFilterInCurrentBoard({
        name: cleanName,
        color: data.color,
        labelIds: data.labelIds,
      }),
    );

    onBack();
  }, [onBack, data, dispatch]);

  return (
    <>
      <Popup.Header onBack={onBack}>
        {t('common.createCustomFilter', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <Form onSubmit={handleSubmit}>
          <Editor data={data} setData={setData} />
          <Button positive content={t('action.createCustomFilter')} />
        </Form>
      </Popup.Content>
    </>
  );
});

AddStep.propTypes = {
  onBack: PropTypes.func.isRequired,
};

export default AddStep;
