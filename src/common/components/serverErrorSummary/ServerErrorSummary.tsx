import { ErrorSummary } from 'hds-react';
import uniqueId from 'lodash/uniqueId';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { scroller } from 'react-scroll';

import { ServerErrorItem } from '../../../types';
import getPageHeaderHeight from '../../../utils/getPageHeaderHeight';
import styles from './serverErrorSummary.module.scss';

interface Props {
  errors: ServerErrorItem[];
  id?: string;
}
const ServerErrorSummary: React.FC<Props> = ({ errors, id: _id }) => {
  const [id] = React.useState(_id || uniqueId('server-error-summary-'));
  const { t } = useTranslation(['common']);

  React.useEffect(() => {
    if (errors.length) {
      scroller.scrollTo(id, {
        delay: 0,
        duration: 500,
        offset: 0 - (getPageHeaderHeight() + 24),
        smooth: true,
      });
    }
  }, [errors, id]);

  if (!errors.length) return null;

  return (
    <div className={styles.serverErrorSummary} id={id}>
      <ErrorSummary
        className={styles.serverErrorSummary}
        label={t('common:titleServerErrorSummary')}
        size="default"
      >
        <ul>
          {errors.map(({ label, message }) => (
            <li key={`${label}-${message}`}>
              {label ? (
                <span>
                  <strong>{label}:</strong> {message}
                </span>
              ) : (
                message
              )}
            </li>
          ))}
        </ul>
      </ErrorSummary>
    </div>
  );
};

export default ServerErrorSummary;
