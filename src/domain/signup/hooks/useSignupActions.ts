import { useSession } from 'next-auth/react';

import useHandleError from '../../../hooks/useHandleError';
import useMountedState from '../../../hooks/useMountedState';
import { ExtendedSession, MutationCallbacks } from '../../../types';
import { Registration } from '../../registration/types';
import { getSeatsReservationData } from '../../reserveSeats/utils';
import { useSignupGroupFormContext } from '../../signupGroup/signupGroupFormContext/hooks/useSignupGroupFormContext';
import { SignupGroupFormFields } from '../../signupGroup/types';
import { SIGNUP_ACTIONS } from '../constants';
import {
  useCreateSignupsMutation,
  useDeleteSignupMutation,
  useUpdateSignupMutation,
} from '../mutation';
import {
  CreateSignupsResponse,
  Signup,
  SignupInput,
  SignupQueryVariables,
  UpdateSignupMutationInput,
} from '../types';
import {
  getCreateSignupsPayload,
  getUpdateSignupPayload,
  omitSensitiveDataFromSignupPayload,
  omitSensitiveDataFromSignupsPayload,
} from '../utils';

interface Props {
  registration: Registration;
  signup?: Signup;
}

type UseSignupActionsState = {
  createSignups: (
    values: SignupGroupFormFields,
    callbacks?: MutationCallbacks<CreateSignupsResponse>
  ) => Promise<void>;
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

  const clean = () => {
    savingFinished();
    closeModal();
  };

  const cleanAfterCreate = async (
    response: CreateSignupsResponse,
    callbacks?: MutationCallbacks<CreateSignupsResponse>
  ) => {
    clean();
    // Call callback function if defined
    callbacks?.onSuccess?.(response);
  };

  const cleanAfterUpdate = async (
    id: string,
    callbacks?: MutationCallbacks
  ) => {
    clean();
    // Call callback function if defined
    callbacks?.onSuccess?.(id);
  };

  const { handleError } = useHandleError<
    | SignupQueryVariables
    | Partial<UpdateSignupMutationInput>
    | Partial<SignupInput>,
    Signup
  >();

  const createSignupsMutation = useCreateSignupsMutation({
    session,
  });
  const deleteSignupMutation = useDeleteSignupMutation({
    session,
  });
  const updateSignupMutation = useUpdateSignupMutation({
    session,
  });

  const deleteSignup = async (callbacks?: MutationCallbacks) => {
    setSaving(SIGNUP_ACTIONS.DELETE);

    const id = signup?.id as string;
    deleteSignupMutation.mutate(
      { id },
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
          cleanAfterUpdate(id, callbacks);
        },
      }
    );
  };

  const createSignups = async (
    values: SignupGroupFormFields,
    callbacks?: MutationCallbacks<CreateSignupsResponse>
  ) => {
    setSaving(SIGNUP_ACTIONS.CREATE);
    const reservationData = getSeatsReservationData(registration.id);
    const payload = getCreateSignupsPayload({
      formValues: values,
      registration,
      reservationCode: reservationData?.code as string,
    });

    createSignupsMutation.mutate(payload, {
      onError: (error, variables) => {
        handleError({
          callbacks,
          error,
          message: 'Failed to create signups',
          payload: omitSensitiveDataFromSignupsPayload(variables),
          savingFinished,
        });
      },
      onSuccess: (data) => {
        cleanAfterCreate(data, callbacks);
      },
    });
  };

  const updateSignup = async (
    values: SignupGroupFormFields,
    callbacks?: MutationCallbacks
  ) => {
    setSaving(SIGNUP_ACTIONS.UPDATE);

    const id = signup?.id as string;
    const payload: UpdateSignupMutationInput = {
      ...getUpdateSignupPayload({
        formValues: values,
        hasSignupGroup: Boolean(signup?.signup_group),
        id: signup?.id as string,
        registration: registration,
      }),
    };

    updateSignupMutation.mutate(payload, {
      onError: (error, variables) => {
        handleError({
          callbacks,
          error,
          message: 'Failed to update signup',
          payload: omitSensitiveDataFromSignupPayload(variables),
          savingFinished,
        });
      },
      onSuccess: () => {
        cleanAfterUpdate(id, callbacks);
      },
    });
  };

  return {
    createSignups,
    deleteSignup,
    saving,
    updateSignup,
  };
};

export default useSignupActions;
