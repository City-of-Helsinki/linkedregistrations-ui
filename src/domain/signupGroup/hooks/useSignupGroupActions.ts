import { useSession } from 'next-auth/react';

import useHandleError from '../../../hooks/useHandleError';
import useMountedState from '../../../hooks/useMountedState';
import { ExtendedSession, MutationCallbacks } from '../../../types';
import { Registration } from '../../registration/types';
import { getSeatsReservationData } from '../../reserveSeats/utils';
import { SIGNUP_GROUP_ACTIONS } from '../constants';
import {
  useCreateSignupGroupMutation,
  useDeleteSignupGroupMutation,
  useUpdateSignupGroupMutation,
} from '../mutation';
import { useSignupGroupFormContext } from '../signupGroupFormContext/hooks/useSignupGroupFormContext';
import {
  CreateSignupGroupMutationInput,
  DeleteSignupGroupMutationInput,
  SignupGroup,
  SignupGroupFormFields,
  UpdateSignupGroupMutationInput,
} from '../types';
import { getSignupGroupPayload, getUpdateSignupGroupPayload } from '../utils';

interface Props {
  registration: Registration;
  signupGroup?: SignupGroup;
}

type UseSignupActionsState = {
  createSignupGroup: (
    values: SignupGroupFormFields,
    callbacks?: MutationCallbacks
  ) => Promise<void>;
  deleteSignupGroup: (callbacks?: MutationCallbacks) => Promise<void>;
  saving: SIGNUP_GROUP_ACTIONS | null;
  updateSignupGroup: (
    values: SignupGroupFormFields,
    callbacks?: MutationCallbacks
  ) => Promise<void>;
};
const useSignupGroupActions = ({
  registration,
  signupGroup,
}: Props): UseSignupActionsState => {
  const { data: session } = useSession() as { data: ExtendedSession | null };
  const [saving, setSaving] = useMountedState<SIGNUP_GROUP_ACTIONS | null>(
    null
  );
  const { closeModal } = useSignupGroupFormContext();

  const savingFinished = () => {
    setSaving(null);
  };

  const cleanAfterUpdate = async (callbacks?: MutationCallbacks) => {
    savingFinished();
    closeModal();
    // Call callback function if defined
    await (callbacks?.onSuccess && callbacks.onSuccess());
  };

  const { handleError } = useHandleError<
    CreateSignupGroupMutationInput | DeleteSignupGroupMutationInput,
    SignupGroup
  >();

  const createSignupGroupMutation = useCreateSignupGroupMutation({
    session,
  });
  const deleteSignupGroupMutation = useDeleteSignupGroupMutation({
    session,
  });
  const updateSignupGroupMutation = useUpdateSignupGroupMutation({
    session,
  });

  const createSignupGroup = async (
    values: SignupGroupFormFields,
    callbacks?: MutationCallbacks
  ) => {
    setSaving(SIGNUP_GROUP_ACTIONS.CREATE);
    const reservationData = getSeatsReservationData(registration.id);
    const payload = getSignupGroupPayload({
      formValues: values,
      registration,
      reservationCode: reservationData?.code as string,
    });

    createSignupGroupMutation.mutate(payload, {
      onError: (error, variables) => {
        handleError({
          callbacks,
          error,
          message: 'Failed to create signup group',
          payload: variables,
          savingFinished,
        });
      },
      onSuccess: () => {
        cleanAfterUpdate(callbacks);
      },
    });
  };

  const deleteSignupGroup = async (callbacks?: MutationCallbacks) => {
    setSaving(SIGNUP_GROUP_ACTIONS.DELETE);

    deleteSignupGroupMutation.mutate(
      {
        id: signupGroup?.id as string,
      },
      {
        onError: (error, variables) => {
          handleError({
            callbacks,
            error,
            message: 'Failed to delete signup',
            object: signupGroup,
            payload: variables,
            savingFinished,
          });
        },
        onSuccess: () => {
          cleanAfterUpdate(callbacks);
        },
      }
    );
  };

  const updateSignupGroup = async (
    values: SignupGroupFormFields,
    callbacks?: MutationCallbacks
  ) => {
    setSaving(SIGNUP_GROUP_ACTIONS.UPDATE);
    const payload: UpdateSignupGroupMutationInput = getUpdateSignupGroupPayload(
      {
        formValues: values,
        id: signupGroup?.id as string,
        registration: registration,
      }
    );

    updateSignupGroupMutation.mutate(payload, {
      onError: (error, variables) => {
        handleError({
          callbacks,
          error,
          message: 'Failed to update signup group',
          object: signupGroup,
          payload: variables,
          savingFinished,
        });
      },
      onSuccess: () => {
        cleanAfterUpdate(callbacks);
      },
    });
  };

  return {
    createSignupGroup,
    deleteSignupGroup,
    saving,
    updateSignupGroup,
  };
};

export default useSignupGroupActions;
