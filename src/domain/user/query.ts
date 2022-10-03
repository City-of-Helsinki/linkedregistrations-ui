import {
  QueryClient,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import { NextPageContext } from 'next';

import { User, UserQueryVariables } from './types';
import { fetchUser } from './utils';

/* istanbul ignore next */
export const fetchUserQuery = (
  queryClient: QueryClient,
  args: UserQueryVariables,
  ctx?: Pick<NextPageContext, 'req' | 'res'>
): Promise<User> => {
  return queryClient.fetchQuery(['user', args.username], () =>
    fetchUser(args, ctx)
  );
};

export const useUserQuery = (
  args: UserQueryVariables,
  options?: Pick<UseQueryOptions, 'enabled'>
): UseQueryResult<User> => {
  return useQuery<User, Error>(
    ['user', args.username],
    () => fetchUser(args),
    options
  );
};
