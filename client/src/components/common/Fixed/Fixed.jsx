/*!
 * Copyright (c) 2026 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

import selectors from '../../../selectors';
import Header from '../Header';
import PromoBanner from '../PromoBanner/PromoBanner';
import Favorites from '../Favorites';
import HomeActions from '../HomeActions';
import Project from '../../projects/Project';
import BoardActions from '../../boards/BoardActions';

import styles from './Fixed.module.scss';

const CSS_VAR = '--fixed-height';

const Fixed = React.memo(() => {
  const { projectId } = useSelector(selectors.selectPath);
  const board = useSelector(selectors.selectCurrentBoard);

  const wrapperRef = useRef(null);

  // Expose the real height of the fixed header as a CSS variable so the board
  // content below can offset itself correctly. The header wraps onto extra rows
  // on narrow screens (e.g. many custom filters on mobile), so a static offset
  // would let the content slide underneath it.
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      const height = wrapperRef.current ? wrapperRef.current.offsetHeight : 0;
      document.documentElement.style.setProperty(CSS_VAR, `${height}px`);
    });

    resizeObserver.observe(wrapperRef.current);

    return () => {
      resizeObserver.disconnect();
      document.documentElement.style.removeProperty(CSS_VAR);
    };
  }, []);

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <Header />
      <PromoBanner />
      <Favorites />
      {projectId === undefined && <HomeActions />}
      {projectId && <Project />}
      {board && !board.isFetching && <BoardActions />}
    </div>
  );
});

export default Fixed;
