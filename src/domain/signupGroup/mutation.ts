import {
  UseMutationOptions,
  UseMutationResult,
  useMutation,
} from '@tanstack/react-query';

import { ExtendedSession } from '../../types';

import {
  CreateSignupGroupMutationInput,
  CreateSignupGroupResponse,
  DeleteSignupGroupMutationInput,
  UpdateSignupGroupMutationInput,
  UpdateSignupGroupResponse,
} from './types';
import {
  createSignupGroup,
  deleteSignupGroup,
  updateSignupGroup,
} from './utils';

export const useCreateSignupGroupMutation = ({
  options,
  session,
}: {
  options?: UseMutationOptions<
    CreateSignupGroupResponse,
    Error,
    CreateSignupGroupMutationInput
  >;
  session: ExtendedSession | null;
}): UseMutationResult<
  CreateSignupGroupResponse,
  Error,
  CreateSignupGroupMutationInput
> => {
  return useMutation((input) => createSignupGroup({ input, session }), options);
};

export const useDeleteSignupGroupMutation = ({
  options,
  session,
}: {
  options?: UseMutationOptions<null, Error, DeleteSignupGroupMutationInput>;
  session: ExtendedSession | null;
}): UseMutationResult<null, Error, DeleteSignupGroupMutationInput> => {
  return useMutation(
    ({ id }) =>
      deleteSignupGroup({
        id,
        session,
      }),
    options
  );
};

export const useUpdateSignupGroupMutation = ({
  options,
  session,
}: {
  options?: UseMutationOptions<
    UpdateSignupGroupResponse,
    Error,
    UpdateSignupGroupMutationInput
  >;
  session: ExtendedSession | null;
}): UseMutationResult<
  UpdateSignupGroupResponse,
  Error,
  UpdateSignupGroupMutationInput
> => {
  return useMutation(
    (input) =>
      updateSignupGroup({
        input,
        session,
      }),
    options
  );
};
