import { useTranslation } from 'next-i18next';
import { FC } from 'react';

import { Registration } from '../../../registration/types';
import {
  getFreeAttendeeCapacity,
  getFreeWaitingListCapacity,
  isAttendeeCapacityUsed,
} from '../../../registration/utils';

type Props = {
  registration: Registration;
};
const AvailableSeatsText: FC<Props> = ({ registration }) => {
  const { t } = useTranslation(['enrolment']);

  const freeAttendeeCapacity = getFreeAttendeeCapacity(registration);
  const attendeeCapacityUsed = isAttendeeCapacityUsed(registration);
  const freeWaitingListCapacity = getFreeWaitingListCapacity(registration);

  return (
    <>
      {typeof freeAttendeeCapacity === 'number' && !attendeeCapacityUsed && (
        <p>
          {t('freeAttendeeCapacity')} <strong>{freeAttendeeCapacity}</strong>
        </p>
      )}
      {attendeeCapacityUsed && typeof freeWaitingListCapacity === 'number' && (
        <p>
          {t('freeWaitingListCapacity')}{' '}
          <strong>{freeWaitingListCapacity}</strong>
        </p>
      )}
    </>
  );
};

export default AvailableSeatsText;
