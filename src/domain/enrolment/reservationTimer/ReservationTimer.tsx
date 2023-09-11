import pick from 'lodash/pick';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '../../app/routes/constants';
import { Registration } from '../../registration/types';
import {
  clearSeatsReservationData,
  getRegistrationTimeLeft,
  getSeatsReservationData,
  isSeatsReservationExpired,
} from '../../reserveSeats/utils';
import { clearCreateSignupGroupFormData } from '../../signupGroup/utils';
import { ENROLMENT_MODALS, ENROLMENT_QUERY_PARAMS } from '../constants';
import { useEnrolmentPageContext } from '../enrolmentPageContext/hooks/useEnrolmentPageContext';
import { useEnrolmentServerErrorsContext } from '../enrolmentServerErrorsContext/hooks/useEnrolmentServerErrorsContext';
import useSeatsReservationActions from '../hooks/useSeatsReservationActions';
import ReservationTimeExpiredModal from '../modals/reservationTimeExpiredModal/ReservationTimeExpiredModal';
import { SignupFields } from '../types';

const getTimeStr = (timeLeft: number) => {
  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor(timeLeft / 60) % 60;
  const seconds = timeLeft % 60;

  return [
    hours,
    ...[minutes, seconds].map((n) => n.toString().padStart(2, '0')),
  ]
    .filter((i) => i)
    .join(':');
};

interface ReservationTimerProps {
  callbacksDisabled: boolean;
  disableCallbacks: () => void;
  initReservationData: boolean;
  onDataNotFound?: () => void;
  registration: Registration;
  setSignups?: (value: SignupFields[]) => void;
  signups?: SignupFields[];
}

const ReservationTimer: React.FC<ReservationTimerProps> = ({
  callbacksDisabled,
  disableCallbacks,
  initReservationData,
  onDataNotFound,
  registration,
  setSignups,
  signups,
}) => {
  const router = useRouter();
  const { t } = useTranslation('enrolment');

  const creatingReservationStarted = useRef(false);
  const timerEnabled = useRef(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const registrationId = useMemo(() => registration.id, [registration]);

  const { createSeatsReservation } = useSeatsReservationActions({
    registration,
    setSignups,
    signups,
  });
  const { openModal, setOpenModal } = useEnrolmentPageContext();
  const { setServerErrorItems, showServerErrors } =
    useEnrolmentServerErrorsContext();

  const enableTimer = useCallback(() => {
    timerEnabled.current = true;
  }, []);

  const goToPage = (pathname: string) => {
    router.push({
      pathname,
      query: pick(router.query, [
        ENROLMENT_QUERY_PARAMS.IFRAME,
        ENROLMENT_QUERY_PARAMS.REDIRECT_URL,
      ]),
    });
  };

  const handleTryAgain = () => {
    if (router.pathname === ROUTES.CREATE_SIGNUP_GROUP) {
      router.reload();
    } else {
      goToPage(
        ROUTES.CREATE_SIGNUP_GROUP.replace(
          '[registrationId]',
          router.query.registrationId as string
        )
      );
    }
  };

  React.useEffect(() => {
    const data = getSeatsReservationData(registrationId);

    /* istanbul ignore else */
    if (!creatingReservationStarted.current && !data) {
      creatingReservationStarted.current = true;
      if (initReservationData) {
        // Clear server errors
        setServerErrorItems([]);

        // useEffect runs twice in React v18.0, so start creating new seats reservation
        // only if creatingReservationStarted is false
        createSeatsReservation({
          onError: (error) =>
            showServerErrors(
              { error: JSON.parse(error.message) },
              'seatsReservation'
            ),
          onSuccess: (seatsReservation) => {
            enableTimer();
            if (seatsReservation) {
              setTimeLeft(getRegistrationTimeLeft(seatsReservation));
            }
          },
        });
      } else if (!data) {
        onDataNotFound && onDataNotFound();
      }
    } else if (data) {
      enableTimer();
      setTimeLeft(getRegistrationTimeLeft(data));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    const clearDataIfReservationExpired = async () => {
      /* istanbul ignore else */
      if (timerEnabled.current) {
        const data = getSeatsReservationData(registrationId);
        setTimeLeft(getRegistrationTimeLeft(data));

        /* istanbul ignore else */
        if (!callbacksDisabled) {
          if (!data || isSeatsReservationExpired(data)) {
            disableCallbacks();

            clearCreateSignupGroupFormData(registrationId);
            clearSeatsReservationData(registrationId);
            const session = await getSession();

            // Show modal only if user is authenticated
            if (session) {
              setOpenModal(ENROLMENT_MODALS.RESERVATION_TIME_EXPIRED);
            }
          }
        }
      }
    };
    const interval = setInterval(() => {
      clearDataIfReservationExpired();
    }, 1000);

    return () => clearInterval(interval);
  }, [
    callbacksDisabled,
    disableCallbacks,
    registrationId,
    setOpenModal,
    setTimeLeft,
    timeLeft,
  ]);

  return (
    <>
      <ReservationTimeExpiredModal
        isOpen={openModal === ENROLMENT_MODALS.RESERVATION_TIME_EXPIRED}
        onTryAgain={handleTryAgain}
      />

      <div>
        {t('timeLeft')}{' '}
        <strong>{timeLeft !== null && getTimeStr(timeLeft)}</strong>
      </div>
    </>
  );
};

export default ReservationTimer;
