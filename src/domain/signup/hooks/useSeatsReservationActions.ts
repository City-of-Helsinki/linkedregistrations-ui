/* eslint-disable @typescript-eslint/no-explicit-any */
import { useSession } from 'next-auth/react';

import useHandleError from '../../../hooks/useHandleError';
import useMountedState from '../../../hooks/useMountedState';
import { ExtendedSession, MutationCallbacks } from '../../../types';
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
import { useSignupGroupFormContext } from '../../signupGroup/signupGroupFormContext/hooks/useSignupGroupFormContext';
import { SignupFormFields } from '../../signupGroup/types';
import { getNewSignups } from '../../signupGroup/utils';
import { SIGNUP_MODALS } from '../constants';

type UseSeatsReservationActionsProps = {
  registration: Registration;
  setSignups?: (value: SignupFormFields[]) => void;
  signups?: SignupFormFields[];
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
  registration,
  setSignups,
  signups,
}: UseSeatsReservationActionsProps): UseSeatsReservationActionsState => {
  const { data: session } = useSession() as { data: ExtendedSession | null };
  const [saving, setSaving] = useMountedState(false);

  const { closeModal, setOpenModal } = useSignupGroupFormContext();

  const registrationId = registration.id;

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
    if (setSignups) {
      const newSignups = getNewSignups({
        signups: signups ?? /* istanbul ignore next */ [],
        seatsReservation,
      });

      setSignups(newSignups);
    }
    setSeatsReservationData(registrationId, seatsReservation);

    // Show modal to inform that persons will be added to the waiting list
    if (seatsReservation.in_waitlist) {
      setOpenModal(SIGNUP_MODALS.PERSONS_ADDED_TO_WAITLIST);
    } else {
      closeModal();
    }
    savingFinished();

    // Call callback function if defined
    await (callbacks?.onSuccess && callbacks.onSuccess(seatsReservation));
  };

  const { handleError } = useHandleError<
    CreateSeatsReservationInput | UpdateSeatsReservationInput,
    any
  >();

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
      const seatsReservation =
        await createSeatsReservationMutation.mutateAsync(payload);
      cleanAfterUpdate(seatsReservation, callbacks);
    } catch (error) {
      handleError({
        callbacks,
        error,
        message: 'Failed to reserve seats',
        payload,
        savingFinished,
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

    updateSeatsReservationMutation.mutate(payload, {
      onError: (error) => {
        handleError({
          callbacks,
          error,
          message: 'Failed to update seats reservation',
          payload,
          savingFinished,
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
