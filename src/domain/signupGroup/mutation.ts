import {
  UseMutationOptions,
  UseMutationResult,
  useMutation,
} from '@tanstack/react-query';

import { ExtendedSession } from '../../types';

import {
  CreateSignupGroupMutationInput,
  CreateOrUpdateSignupGroupResponse,
  DeleteSignupGroupMutationInput,
  UpdateSignupGroupMutationInput,
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
    CreateOrUpdateSignupGroupResponse,
    Error,
    CreateSignupGroupMutationInput
  >;
  session: ExtendedSession | null;
}): UseMutationResult<
  CreateOrUpdateSignupGroupResponse,
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
    CreateOrUpdateSignupGroupResponse,
    Error,
    UpdateSignupGroupMutationInput
  >;
  session: ExtendedSession | null;
}): UseMutationResult<
  CreateOrUpdateSignupGroupResponse,
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
