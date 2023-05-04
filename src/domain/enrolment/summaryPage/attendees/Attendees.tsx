import { useField } from 'formik';
import { useTranslation } from 'next-i18next';
import React from 'react';

import { ENROLMENT_FIELDS } from '../../constants';
import { AttendeeFields } from '../../types';
import Attendee from './attendee/Attendee';
import styles from './attendees.module.scss';

const getAttendeePath = (index: number) =>
  `${ENROLMENT_FIELDS.ATTENDEES}[${index}]`;

const Attendees: React.FC = () => {
  const { t } = useTranslation('summary');

  const [{ value: attendees }] = useField<AttendeeFields[]>({
    name: ENROLMENT_FIELDS.ATTENDEES,
  });

  return (
    <div className={styles.attendees}>
      <h2>{t('titleAttendeesInfo')}</h2>
      {attendees.map((attendee, index) => {
        return (
          <Attendee
            key={index}
            attendee={attendee}
            attendeePath={getAttendeePath(index)}
          />
        );
      })}
    </div>
  );
};

export default Attendees;
