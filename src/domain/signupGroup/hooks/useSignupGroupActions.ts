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
  CreateOrUpdateSignupGroupResponse,
  CreateSignupGroupMutationInput,
  SignupGroup,
  SignupGroupFormFields,
  SignupGroupQueryVariables,
  UpdateSignupGroupMutationInput,
} from '../types';
import {
  getSignupGroupPayload,
  getUpdateSignupGroupPayload,
  omitSensitiveDataFromSignupGroupPayload,
} from '../utils';

interface Props {
  registration: Registration;
  signupGroup?: SignupGroup;
}

type UseSignupActionsState = {
  createSignupGroup: (
    values: SignupGroupFormFields,
    callbacks?: MutationCallbacks<CreateOrUpdateSignupGroupResponse>
  ) => Promise<void>;
  deleteSignupGroup: (callbacks?: MutationCallbacks<string>) => Promise<void>;
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

  const clean = () => {
    savingFinished();
    closeModal();
  };

  const cleanAfterCreate = async (
    response: CreateOrUpdateSignupGroupResponse,
    callbacks?: MutationCallbacks<CreateOrUpdateSignupGroupResponse>
  ) => {
    clean();
    // Call callback function if defined
    callbacks?.onSuccess?.(response);
  };

  const cleanAfterUpdate = async (
    id: string,
    callbacks?: MutationCallbacks<string>
  ) => {
    clean();
    // Call callback function if defined
    callbacks?.onSuccess?.(id);
  };

  const { handleError } = useHandleError<
    Partial<CreateSignupGroupMutationInput> | SignupGroupQueryVariables,
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
    callbacks?: MutationCallbacks<CreateOrUpdateSignupGroupResponse>
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
          payload: omitSensitiveDataFromSignupGroupPayload(variables),
          savingFinished,
        });
      },
      onSuccess: (data) => {
        cleanAfterCreate(data, callbacks);
      },
    });
  };

  const deleteSignupGroup = async (callbacks?: MutationCallbacks<string>) => {
    const id = signupGroup?.id as string;

    setSaving(SIGNUP_GROUP_ACTIONS.DELETE);

    deleteSignupGroupMutation.mutate(
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

  const updateSignupGroup = async (
    values: SignupGroupFormFields,
    callbacks?: MutationCallbacks<string>
  ) => {
    const id = signupGroup?.id as string;

    setSaving(SIGNUP_GROUP_ACTIONS.UPDATE);

    const payload: UpdateSignupGroupMutationInput = {
      ...getUpdateSignupGroupPayload({
        formValues: values,
        id,
        registration: registration,
      }),
    };

    updateSignupGroupMutation.mutate(payload, {
      onError: (error, variables) => {
        handleError({
          callbacks,
          error,
          message: 'Failed to update signup group',
          payload: omitSensitiveDataFromSignupGroupPayload(variables),
          savingFinished,
        });
      },
      onSuccess: () => {
        cleanAfterUpdate(id, callbacks);
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
