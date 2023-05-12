import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
} from '@tanstack/react-query';

import { ExtendedSession } from '../../types';
import {
  CreateEnrolmentMutationInput,
  CreateEnrolmentResponse,
  DeleteEnrolmentMutationInput,
} from './types';
import { createEnrolment, deleteEnrolment } from './utils';

export const useCreateEnrolmentMutation = ({
  options,
  session,
}: {
  options?: UseMutationOptions<
    CreateEnrolmentResponse,
    Error,
    CreateEnrolmentMutationInput
  >;
  session: ExtendedSession | null;
}): UseMutationResult<
  CreateEnrolmentResponse,
  Error,
  CreateEnrolmentMutationInput
> => {
  return useMutation((input) => createEnrolment({ input, session }), options);
};

export const useDeleteEnrolmentMutation = ({
  options,
  session,
}: {
  options?: UseMutationOptions<null, Error, DeleteEnrolmentMutationInput>;
  session: ExtendedSession | null;
}): UseMutationResult<null, Error, DeleteEnrolmentMutationInput> => {
  return useMutation(
    ({ cancellationCode, enrolmentId }) =>
      deleteEnrolment({
        cancellationCode,
        enrolmentId,
        session,
      }),
    options
  );
};
