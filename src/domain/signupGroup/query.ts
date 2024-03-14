import {
  QueryClient,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';

import { ExtendedSession } from '../../types';

import { SignupGroup, SignupGroupQueryVariables } from './types';
import { fetchSignupGroup } from './utils';

export const fetchSignupGroupQuery = ({
  args,
  queryClient,
  session,
}: {
  args: SignupGroupQueryVariables;
  queryClient: QueryClient;
  session: ExtendedSession | null;
}): Promise<SignupGroup> => {
  return queryClient.fetchQuery({
    queryKey: ['signupGroup', args.id],
    queryFn: () => fetchSignupGroup(args, session),
  });
};

export const prefetchSignupGroupQuery = ({
  args,
  queryClient,
  session,
}: {
  args: SignupGroupQueryVariables;
  queryClient: QueryClient;
  session: ExtendedSession | null;
}): Promise<void> => {
  return queryClient.prefetchQuery({
    queryKey: ['signupGroup', args.id],
    queryFn: () => fetchSignupGroup(args, session),
  });
};

export const useSignupGroupQuery = ({
  args,
  options,
  session,
}: {
  args: SignupGroupQueryVariables;
  options?: Pick<UseQueryOptions, 'enabled'>;
  session: ExtendedSession | null;
}): UseQueryResult<SignupGroup> => {
  return useQuery<SignupGroup, Error>({
    queryKey: ['signupGroup', args.id],
    queryFn: () => fetchSignupGroup(args, session),
    ...options,
  });
};
