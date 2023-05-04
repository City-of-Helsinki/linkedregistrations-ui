import { useSession } from 'next-auth/react';

import useMountedState from '../../../hooks/useMountedState';
import { ExtendedSession, MutationCallbacks } from '../../../types';
import { reportError } from '../../app/sentry/utils';
import { Registration } from '../../registration/types';
import { ENROLMENT_ACTIONS } from '../constants';
import { useEnrolmentPageContext } from '../enrolmentPageContext/hooks/useEnrolmentPageContext';
import {
  useCreateEnrolmentMutation,
  useDeleteEnrolmentMutation,
} from '../mutation';
import { CreateEnrolmentMutationInput, Enrolment } from '../types';

interface Props {
  enrolment?: Enrolment;
  registration: Registration;
}

type UseEnrolmentActionsState = {
  cancelEnrolment: (
    cancellationCode: string,
    callbacks?: MutationCallbacks
  ) => Promise<void>;
  createEnrolment: (
    payload: CreateEnrolmentMutationInput,
    callbacks?: MutationCallbacks
  ) => Promise<void>;
  saving: ENROLMENT_ACTIONS | null;
};
const useEnrolmentActions = ({
  enrolment,
  registration,
}: Props): UseEnrolmentActionsState => {
  const { data: session } = useSession() as { data: ExtendedSession | null };
  const [saving, setSaving] = useMountedState<ENROLMENT_ACTIONS | null>(null);

  const { closeModal } = useEnrolmentPageContext();

  const savingFinished = () => {
    setSaving(null);
  };

  const cleanAfterUpdate = async (callbacks?: MutationCallbacks) => {
    savingFinished();
    closeModal();
    // Call callback function if defined
    await (callbacks?.onSuccess && callbacks.onSuccess());
  };

  const handleError = ({
    callbacks,
    error,
    message,
    payload,
  }: {
    callbacks?: MutationCallbacks;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: any;
    message: string;
    payload?: CreateEnrolmentMutationInput | string;
  }) => {
    closeModal();
    savingFinished();

    // Report error to Sentry
    reportError({
      data: {
        error,
        payloadAsString: payload && JSON.stringify(payload),
        enrolment,
      },
      message,
    });

    // Call callback function if defined
    callbacks?.onError?.(error);
  };

  const deleteEnrolmentMutation = useDeleteEnrolmentMutation({
    session,
  });
  const createEnrolmentMutation = useCreateEnrolmentMutation({
    registrationId: registration.id as string,
    session,
  });

  const createEnrolment = async (
    payload: CreateEnrolmentMutationInput,
    callbacks?: MutationCallbacks
  ) => {
    setSaving(ENROLMENT_ACTIONS.CREATE);
    await createEnrolmentMutation.mutate(payload, {
      onError: (error, variables) => {
        handleError({
          callbacks,
          error,
          message: 'Failed to create enrolment',
          payload: variables,
        });
      },
      onSuccess: () => {
        cleanAfterUpdate(callbacks);
      },
    });
  };

  const cancelEnrolment = async (
    cancellationCode: string,
    callbacks?: MutationCallbacks
  ) => {
    setSaving(ENROLMENT_ACTIONS.CANCEL);
    await deleteEnrolmentMutation.mutate(cancellationCode, {
      onError: (error, variables) => {
        handleError({
          callbacks,
          error,
          message: 'Failed to cancel enrolment',
          payload: variables,
        });
      },
      onSuccess: () => {
        cleanAfterUpdate(callbacks);
      },
    });
  };
  return {
    cancelEnrolment,
    createEnrolment,
    saving,
  };
};

export default useEnrolmentActions;
