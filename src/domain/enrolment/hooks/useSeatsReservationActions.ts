import { useSession } from 'next-auth/react';

import useMountedState from '../../../hooks/useMountedState';
import { ExtendedSession, MutationCallbacks } from '../../../types';
import { reportError } from '../../app/sentry/utils';
import { Registration } from '../../registration/types';
import {
  useCreateSeatsReservationMutation,
  useUpdateSeatsReservationMutation,
} from '../../reserveSeats/mutation';
import {
  CreateSeatsReservationInput,
  SeatsReservation,
  UpdateSeatsReservationInput,
} from '../../reserveSeats/types';
import {
  getSeatsReservationData,
  setSeatsReservationData,
} from '../../reserveSeats/utils';
import { ENROLMENT_MODALS } from '../constants';
import { useEnrolmentPageContext } from '../enrolmentPageContext/hooks/useEnrolmentPageContext';
import { AttendeeFields } from '../types';
import { getNewAttendees } from '../utils';

type UseSeatsReservationActionsProps = {
  attendees?: AttendeeFields[];
  registration: Registration;
  setAttendees?: (value: AttendeeFields[]) => void;
};

type UseSeatsReservationActionsState = {
  createSeatsReservation: (
    callbacks?: MutationCallbacks<SeatsReservation>
  ) => Promise<void>;
  saving: boolean;
  updateSeatsReservation: (
    seats: number,
    callbacks?: MutationCallbacks<SeatsReservation>
  ) => Promise<void>;
};

const useSeatsReservationActions = ({
  attendees,
  registration,
  setAttendees,
}: UseSeatsReservationActionsProps): UseSeatsReservationActionsState => {
  const { data: session } = useSession() as { data: ExtendedSession | null };
  const [saving, setSaving] = useMountedState(false);

  const { closeModal, setOpenModal } = useEnrolmentPageContext();

  const registrationId = registration.id as string;

  const createSeatsReservationMutation = useCreateSeatsReservationMutation({
    session,
  });
  const updateSeatsReservationMutation = useUpdateSeatsReservationMutation({
    session,
  });

  const savingFinished = () => {
    setSaving(false);
  };

  const cleanAfterUpdate = async (
    seatsReservation: SeatsReservation,
    callbacks?: MutationCallbacks<SeatsReservation>
  ) => {
    /* istanbul ignore else */
    if (setAttendees) {
      const newAttendees = getNewAttendees({
        attendees: attendees || /* istanbul ignore next */ [],
        seatsReservation,
      });

      setAttendees(newAttendees);
    }
    setSeatsReservationData(registrationId, seatsReservation);

    // Show modal to inform that persons will be added to the waiting list
    if (seatsReservation.in_waitlist) {
      setOpenModal(ENROLMENT_MODALS.PERSONS_ADDED_TO_WAITLIST);
    } else {
      closeModal();
    }
    savingFinished();

    // Call callback function if defined
    await (callbacks?.onSuccess && callbacks.onSuccess(seatsReservation));
  };

  const handleError = ({
    callbacks,
    error,
    message,
    payload,
  }: {
    callbacks?: MutationCallbacks<SeatsReservation>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: any;
    message: string;
    payload?: CreateSeatsReservationInput | UpdateSeatsReservationInput;
  }) => {
    savingFinished();
    closeModal();

    // Report error to Sentry
    reportError({
      data: {
        error,
        payload,
        payloadAsString: JSON.stringify(payload),
      },
      message,
    });

    // Call callback function if defined
    callbacks?.onError?.(error);
  };

  const createSeatsReservation = async (
    callbacks?: MutationCallbacks<SeatsReservation>
  ) => {
    const payload: CreateSeatsReservationInput = {
      registration: registrationId,
      seats: 1,
    };

    try {
      // For some reason onSuccess and onError callbacks are not called when using mutate function
      // Use mutateAsync instead
      const seatsReservation = await createSeatsReservationMutation.mutateAsync(
        payload
      );
      cleanAfterUpdate(seatsReservation, callbacks);
    } catch (error) {
      handleError({
        callbacks,
        error,
        message: 'Failed to reserve seats',
        payload,
      });
    }
  };

  const updateSeatsReservation = async (
    seats: number,
    callbacks?: MutationCallbacks<SeatsReservation>
  ) => {
    setSaving(true);
    const reservationData = getSeatsReservationData(registrationId);

    /* istanbul ignore next */
    if (!reservationData) {
      throw new Error('Reservation data is not stored to session storage');
    }

    const payload: UpdateSeatsReservationInput = {
      code: reservationData.code,
      id: reservationData.id,
      registration: registrationId,
      seats,
    };

    await updateSeatsReservationMutation.mutate(payload, {
      onError: (error) => {
        handleError({
          callbacks,
          error,
          message: 'Failed to update seats reservation',
          payload,
        });
      },
      onSuccess: (seatsReservation) => {
        cleanAfterUpdate(seatsReservation, callbacks);
      },
    });
  };

  return { createSeatsReservation, saving, updateSeatsReservation };
};

export default useSeatsReservationActions;
