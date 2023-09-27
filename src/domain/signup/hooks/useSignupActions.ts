import { useSession } from 'next-auth/react';

import useHandleError from '../../../hooks/useHandleError';
import useMountedState from '../../../hooks/useMountedState';
import { ExtendedSession, MutationCallbacks } from '../../../types';
import { Registration } from '../../registration/types';
import { useSignupGroupFormContext } from '../../signupGroup/signupGroupFormContext/hooks/useSignupGroupFormContext';
import { SignupGroupFormFields } from '../../signupGroup/types';
import { SIGNUP_ACTIONS } from '../constants';
import { useDeleteSignupMutation, useUpdateSignupMutation } from '../mutation';
import {
  DeleteSignupMutationInput,
  Signup,
  UpdateSignupMutationInput,
} from '../types';
import { getUpdateSignupPayload } from '../utils';

interface Props {
  registration: Registration;
  signup?: Signup;
}

type UseSignupActionsState = {
  deleteSignup: (callbacks?: MutationCallbacks) => Promise<void>;
  saving: SIGNUP_ACTIONS | null;
  updateSignup: (
    values: SignupGroupFormFields,
    callbacks?: MutationCallbacks
  ) => Promise<void>;
};
const useSignupActions = ({
  registration,
  signup,
}: Props): UseSignupActionsState => {
  const { data: session } = useSession() as { data: ExtendedSession | null };
  const [saving, setSaving] = useMountedState<SIGNUP_ACTIONS | null>(null);

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
    DeleteSignupMutationInput | UpdateSignupMutationInput,
    Signup
  >();

  const deleteSignupMutation = useDeleteSignupMutation({
    session,
  });
  const updateSignupMutation = useUpdateSignupMutation({
    session,
  });

  const deleteSignup = async (callbacks?: MutationCallbacks) => {
    setSaving(SIGNUP_ACTIONS.DELETE);

    deleteSignupMutation.mutate(
      {
        registrationId: registration.id,
        signupId: signup?.id as string,
      },
      {
        onError: (error, variables) => {
          handleError({
            callbacks,
            error,
            message: 'Failed to delete signup',
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

  const updateSignup = async (
    values: SignupGroupFormFields,
    callbacks?: MutationCallbacks
  ) => {
    setSaving(SIGNUP_ACTIONS.UPDATE);
    const payload: UpdateSignupMutationInput = getUpdateSignupPayload({
      formValues: values,
      id: signup?.id as string,
      registration: registration,
    });

    updateSignupMutation.mutate(payload, {
      onError: (error, variables) => {
        handleError({
          callbacks,
          error,
          message: 'Failed to update signup',
          object: signup,
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
    deleteSignup,
    saving,
    updateSignup,
  };
};

export default useSignupActions;
