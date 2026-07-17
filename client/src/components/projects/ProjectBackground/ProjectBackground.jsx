/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import React, { useEffect, useMemo } from 'react';
import classNames from 'classnames';
import { useSelector } from 'react-redux';

import selectors from '../../../selectors';
import { ProjectBackgroundTypes } from '../../../constants/Enums';
import { LIGHT_BACKGROUND_GRADIENTS } from '../../../constants/BackgroundGradients';

import styles from './ProjectBackground.module.scss';
import globalStyles from '../../../styles.module.scss';

const ProjectBackground = React.memo(() => {
  const selectBackgroundImageById = useMemo(() => selectors.makeSelectBackgroundImageById(), []);

  const { backgroundImageId, backgroundType, backgroundGradient } = useSelector(
    selectors.selectCurrentProject,
  );

  const backgroundImageUrl = useSelector((state) => {
    if (!backgroundType || backgroundType !== ProjectBackgroundTypes.IMAGE) {
      return null;
    }

    const backgroundImage = selectBackgroundImageById(state, backgroundImageId);

    if (!backgroundImage) {
      return null;
    }

    return backgroundImage.url;
  });

  // The chrome bands (header, project, board actions) render white text over dark
  // scrims. Light gradients would wash that text out, so flag them on the app root
  // and let the affected components darken their scrims under `.light-background`.
  const isLightBackground =
    backgroundType === ProjectBackgroundTypes.GRADIENT &&
    LIGHT_BACKGROUND_GRADIENTS.includes(backgroundGradient);

  useEffect(() => {
    const appRoot = document.getElementById('app');

    if (!appRoot) {
      return undefined;
    }

    appRoot.classList.toggle('light-background', isLightBackground);

    return () => {
      appRoot.classList.remove('light-background');
    };
  }, [isLightBackground]);

  return (
    <div
      className={classNames(
        styles.wrapper,
        backgroundType === ProjectBackgroundTypes.GRADIENT &&
          globalStyles[`background${upperFirst(camelCase(backgroundGradient))}`],
      )}
      style={{
        background: backgroundImageUrl && `url("${backgroundImageUrl}") center / cover`,
      }}
    />
  );
});

export default ProjectBackground;
