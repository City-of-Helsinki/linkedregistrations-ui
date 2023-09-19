import { useTranslation } from 'next-i18next';
import React from 'react';

import useLocale from '../../../hooks/useLocale';
import { Event } from '../../event/types';
import { getEventFields } from '../../event/utils';
import DateText from '../../signupGroup/eventInfo/DateText';

import styles from './registrationInfo.module.scss';

interface Props {
  event: Event;
}

const RegistrationInfo: React.FC<Props> = ({ event }) => {
  const { t } = useTranslation('attendanceList');
  const locale = useLocale();

  const { endTime, name, startTime } = getEventFields(event, locale);
  const pageTitle = t('attendanceList:pageTitle', { name });

  return (
    <div className={styles.registrationInfo}>
      <div className={styles.heading}>
        <h1>{pageTitle}</h1>
      </div>
      <p>
        <DateText endTime={endTime} startTime={startTime} />
      </p>
    </div>
  );
};

export default RegistrationInfo;
