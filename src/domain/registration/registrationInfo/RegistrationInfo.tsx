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
  const locale = useLocale();

  const { endTime, startTime } = getEventFields(event, locale);

  return (
    <div className={styles.registrationInfo}>
      <p>
        <DateText endTime={endTime} startTime={startTime} />
      </p>
    </div>
  );
};

export default RegistrationInfo;
