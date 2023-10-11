import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
} from '@tanstack/react-query';

import { ExtendedSession } from '../../types';

import {
  DeleteSignupMutationInput,
  PatchSignupMutationInput,
  Signup,
  UpdateSignupMutationInput,
} from './types';
import { deleteSignup, patchSignup, updateSignup } from './utils';

export const useDeleteSignupMutation = ({
  options,
  session,
}: {
  options?: UseMutationOptions<null, Error, DeleteSignupMutationInput>;
  session: ExtendedSession | null;
}): UseMutationResult<null, Error, DeleteSignupMutationInput> => {
  return useMutation(
    ({ signupId }) =>
      deleteSignup({
        id: signupId,
        session,
      }),
    options
  );
};

export const usePatchSignupMutation = ({
  options,
  session,
}: {
  options?: UseMutationOptions<Signup, Error, PatchSignupMutationInput>;
  session: ExtendedSession | null;
}): UseMutationResult<Signup, Error, PatchSignupMutationInput> => {
  return useMutation(
    (input) =>
      patchSignup({
        input,
        session,
      }),
    options
  );
};

export const useUpdateSignupMutation = ({
  options,
  session,
}: {
  options?: UseMutationOptions<Signup, Error, UpdateSignupMutationInput>;
  session: ExtendedSession | null;
}): UseMutationResult<Signup, Error, UpdateSignupMutationInput> => {
  return useMutation(
    (input) =>
      updateSignup({
        input,
        session,
      }),
    options
  );
};
