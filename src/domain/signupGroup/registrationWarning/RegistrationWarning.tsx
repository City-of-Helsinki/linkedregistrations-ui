import { useTranslation } from 'next-i18next/pages';
import React, { useMemo } from 'react';

import Notification from '../../../common/components/notification/Notification';
import { Registration } from '../../registration/types';
import { getRegistrationWarning } from '../../registration/utils';
import {
  getSeatsReservationData,
  isSeatsReservationExpired,
} from '../../reserveSeats/utils';

import styles from './registrationWarning.module.scss';

type Props = {
  registration: Registration;
};

const RegistrationWarning: React.FC<Props> = ({ registration }) => {
  const { t } = useTranslation(['signup']);
  const registrationWarning = getRegistrationWarning(registration, t);

  const hasReservation = useMemo(() => {
    const data = getSeatsReservationData(registration.id);
    return Boolean(data && !isSeatsReservationExpired(data));
  }, [registration.id]);

  return registrationWarning && !hasReservation ? (
    <Notification className={styles.warning} type="info">
      {registrationWarning}
    </Notification>
  ) : null;
};

export default RegistrationWarning;
