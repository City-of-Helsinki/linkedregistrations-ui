import dynamic from 'next/dynamic';
import { useTranslation } from 'next-i18next';
import { FC, useMemo } from 'react';

import { Registration } from '../../../registration/types';
import {
  getFreeAttendeeCapacity,
  getFreeWaitingListCapacity,
  isAttendeeCapacityUsed,
} from '../../../registration/utils';
import {
  getSeatsReservationData,
  isSeatsReservationExpired,
} from '../../../reserveSeats/utils';

// Lazy load SeatsCount to avoid conflict between client and server
const SeatsCount = dynamic(() => import('./SeatsCount'), { ssr: false });

type Props = {
  registration: Registration;
  className?: string;
};
const AvailableSeatsText: FC<Props> = ({ registration, className }) => {
  const { t } = useTranslation(['signup']);

  const freeAttendeeCapacity = getFreeAttendeeCapacity(registration);
  const attendeeCapacityUsed = isAttendeeCapacityUsed(registration);
  const freeWaitingListCapacity = getFreeWaitingListCapacity(registration);

  const reservedSeats = useMemo(() => {
    const data = getSeatsReservationData(registration.id);
    return data && !isSeatsReservationExpired(data) ? data.seats : 0;
  }, [registration.id]);
  return (
    <>
      {typeof freeAttendeeCapacity === 'number' && !attendeeCapacityUsed && (
        <p className={className}>
          {t('freeAttendeeCapacity')}{' '}
          <SeatsCount seats={freeAttendeeCapacity + reservedSeats} />
        </p>
      )}
      {attendeeCapacityUsed && typeof freeWaitingListCapacity === 'number' && (
        <p className={className}>
          {t('freeWaitingListCapacity')}{' '}
          <SeatsCount seats={freeWaitingListCapacity + reservedSeats} />
        </p>
      )}
    </>
  );
};

export default AvailableSeatsText;
