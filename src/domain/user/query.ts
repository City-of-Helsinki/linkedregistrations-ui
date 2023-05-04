import {
  QueryClient,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';

import { ExtendedSession } from '../../types';
import { User, UserQueryVariables } from './types';
import { fetchUser } from './utils';

export const fetchUserQuery = ({
  args,
  queryClient,
  session,
}: {
  queryClient: QueryClient;
  args: UserQueryVariables;
  session: ExtendedSession | null;
}): Promise<User> => {
  return queryClient.fetchQuery(['user', args.username], () =>
    fetchUser(args, session)
  );
};

export const useUserQuery = ({
  args,
  options,
  session,
}: {
  args: UserQueryVariables;
  options?: Pick<UseQueryOptions, 'enabled'>;
  session: ExtendedSession | null;
}): UseQueryResult<User> => {
  return useQuery<User, Error>(
    ['user', args.username],
    () => fetchUser(args, session),
    options
  );
};
