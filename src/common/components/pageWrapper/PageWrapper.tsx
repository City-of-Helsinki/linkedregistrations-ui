import classNames from 'classnames';
import React from 'react';

import upperCaseFirstLetter from '../../../utils/upperCaseFirstLetter';

import styles from './pageWrapper.module.scss';

export interface PageWrapperProps {
  backgroundColor?: 'white' | 'gray' | 'coatOfArms';
  className?: string;
}
/**
 * Component to set background color for the page. Options are white, gray and coat of arms
 */
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
