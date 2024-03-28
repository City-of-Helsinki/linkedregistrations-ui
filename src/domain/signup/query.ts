import {
  QueryClient,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';

import { ExtendedSession } from '../../types';

import { Signup, SignupQueryVariables } from './types';
import { fetchSignup } from './utils';

export const fetchSignupQuery = ({
  args,
  queryClient,
  session,
}: {
  args: SignupQueryVariables;
  queryClient: QueryClient;
  session: ExtendedSession | null;
}): Promise<Signup> => {
  return queryClient.fetchQuery({
    queryKey: ['signup', args.id],
    queryFn: () => fetchSignup(args, session),
  });
};

export const prefetchSignupQuery = ({
  args,
  queryClient,
  session,
}: {
  args: SignupQueryVariables;
  queryClient: QueryClient;
  session: ExtendedSession | null;
}): Promise<void> => {
  return queryClient.prefetchQuery({
    queryKey: ['signup', args.id],
    queryFn: () => fetchSignup(args, session),
  });
};

export const useSignupQuery = ({
  args,
  options,
  session,
}: {
  args: SignupQueryVariables;
  options?: Pick<UseQueryOptions, 'enabled'>;
  session: ExtendedSession | null;
}): UseQueryResult<Signup> => {
  return useQuery<Signup, Error>({
    queryKey: ['signup', args.id],
    queryFn: () => fetchSignup(args, session),
    ...options,
  });
};
