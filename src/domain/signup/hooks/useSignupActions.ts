import { useSession } from 'next-auth/react';

import useHandleError from '../../../hooks/useHandleError';
import useMountedState from '../../../hooks/useMountedState';
import { ExtendedSession, MutationCallbacks } from '../../../types';
import { Registration } from '../../registration/types';
import { useSignupGroupFormContext } from '../../signupGroup/signupGroupFormContext/hooks/useSignupGroupFormContext';
import { SIGNUP_ACTIONS } from '../constants';
import { useDeleteSignupMutation } from '../mutation';
import { DeleteSignupMutationInput, Signup } from '../types';

interface Props {
  registration: Registration;
  signup?: Signup;
}

type UseSignupActionsState = {
  deleteSignup: (callbacks?: MutationCallbacks) => Promise<void>;
  saving: SIGNUP_ACTIONS | null;
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

  const { handleError } = useHandleError<DeleteSignupMutationInput, Signup>();

  const deleteSignupMutation = useDeleteSignupMutation({
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

  return {
    deleteSignup,
    saving,
  };
};

export default useSignupActions;
