import {
  QueryClient,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';

import { ExtendedSession } from '../../types';
import { Registration, RegistrationQueryVariables } from './types';
import { fetchRegistration } from './utils';

export const fetchRegistrationQuery = ({
  args,
  queryClient,
  session,
}: {
  queryClient: QueryClient;
  args: RegistrationQueryVariables;
  session: ExtendedSession | null;
}): Promise<Registration> => {
  return queryClient.fetchQuery(['registration', args.id], () =>
    fetchRegistration(args, session)
  );
};

export const prefetchRegistrationQuery = ({
  args,
  queryClient,
  session,
}: {
  queryClient: QueryClient;
  args: RegistrationQueryVariables;
  session: ExtendedSession | null;
}): Promise<void> => {
  return queryClient.prefetchQuery(['registration', args.id], () =>
    fetchRegistration(args, session)
  );
};

export const useRegistrationQuery = ({
  args,
  options,
  session,
}: {
  args: RegistrationQueryVariables;
  options?: Pick<UseQueryOptions, 'enabled' | 'retry'>;
  session: ExtendedSession | null;
}): UseQueryResult<Registration> => {
  return useQuery<Registration, Error>(
    ['registration', args.id],
    () => fetchRegistration(args, session),
    options
  );
};
