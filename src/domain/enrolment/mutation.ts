import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
} from '@tanstack/react-query';

import { ExtendedSession } from '../../types';
import { CreateEnrolmentMutationInput, CreateEnrolmentResponse } from './types';
import { createEnrolment, deleteEnrolment } from './utils';

export const useCreateEnrolmentMutation = ({
  options,
  registrationId,
  session,
}: {
  options?: UseMutationOptions<
    CreateEnrolmentResponse,
    Error,
    CreateEnrolmentMutationInput
  >;
  registrationId: string;
  session: ExtendedSession | null;
}): UseMutationResult<
  CreateEnrolmentResponse,
  Error,
  CreateEnrolmentMutationInput
> => {
  return useMutation(
    (input) => createEnrolment({ input, registrationId, session }),
    options
  );
};

export const useDeleteEnrolmentMutation = ({
  options,
  session,
}: {
  options?: UseMutationOptions<null, Error, string>;
  session: ExtendedSession | null;
}): UseMutationResult<null, Error, string> => {
  return useMutation(
    (cancellationCode) => deleteEnrolment({ cancellationCode, session }),
    options
  );
};
