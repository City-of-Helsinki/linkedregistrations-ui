import classNames from 'classnames';
import React from 'react';

import upperCaseFirstLetter from '../../../utils/upperCaseFirstLetter';

import styles from './pageWrapper.module.scss';

export interface PageWrapperProps {
  backgroundColor?: 'white' | 'gray' | 'coatOfArms';
  className?: string;
  /**
   * Translation path of the page title. Translation will be overriden by titleText if defined
   */
}

const PageWrapper: React.FC<React.PropsWithChildren<PageWrapperProps>> = ({
  backgroundColor = 'white',
  children,
  className,
}) => {
  return (
    <div
      className={classNames(
        styles.pageWrapper,
        [styles[`backgroundColor${upperCaseFirstLetter(backgroundColor)}`]],
        className
      )}
    >
      {children}
    </div>
  );
};

export default PageWrapper;
