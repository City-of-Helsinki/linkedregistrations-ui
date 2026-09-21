import classNames from 'classnames';
import {
  LoadingSpinner as HdsLoadingSpinner,
  LoadingSpinnerProps,
} from 'hds-react';
import { useTranslation } from 'next-i18next/pages';
import React from 'react';

import styles from './loadingSpinner.module.scss';

export const testId = 'loading-spinner';

type Props = {
  className?: string;
  isLoading: boolean;
} & LoadingSpinnerProps;

const LoadingSpinner: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  className,
  isLoading,
  loadingFinishedText,
  loadingText,
  small,
  ...rest
}) => {
  const { t } = useTranslation<string>('common');
  return (
    <>
      {isLoading ? (
        <div
          className={classNames(className, styles.loadingSpinnerWrapper)}
          data-testid={testId}
        >
          <HdsLoadingSpinner
            {...rest}
            className={classNames(styles.loadingSpinner, {
              [styles.loadingSpinnerSmall]: small,
            })}
            loadingText={loadingText || (t('loading') as string)}
            loadingFinishedText={
              loadingFinishedText || (t('loadingFinished') as string)
            }
          />
        </div>
      ) : (
        children
      )}
    </>
  );
};

export default LoadingSpinner;
