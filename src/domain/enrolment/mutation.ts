import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
} from '@tanstack/react-query';

import { CreateEnrolmentMutationInput, Enrolment } from './types';
import { createEnrolment, deleteEnrolment } from './utils';

export const useCreateEnrolmentMutation = (
  options?: UseMutationOptions<Enrolment, Error, CreateEnrolmentMutationInput>
): UseMutationResult<Enrolment, Error, CreateEnrolmentMutationInput> => {
  return useMutation((input) => createEnrolment(input), options);
};

export const useDeleteEnrolmentMutation = (
  options?: UseMutationOptions<null, Error, string>
): UseMutationResult<null, Error, string> => {
  return useMutation(
    (cancellationCode) => deleteEnrolment(cancellationCode),
    options
  );
};
