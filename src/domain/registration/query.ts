import {
  QueryClient,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from 'react-query';

import { Registration, RegistrationQueryVariables } from './types';
import { fetchRegistration } from './utils';

/* istanbul ignore next */
export const fetchRegistrationQuery = (
  queryClient: QueryClient,
  args: RegistrationQueryVariables
): Promise<Registration> => {
  return queryClient.fetchQuery(['registration', args.id], () =>
    fetchRegistration(args)
  );
};

/* istanbul ignore next */
export const prefetchRegistrationQuery = (
  queryClient: QueryClient,
  args: RegistrationQueryVariables
): Promise<void> => {
  return queryClient.prefetchQuery(['registration', args.id], () =>
    fetchRegistration(args)
  );
};

export const useRegistrationQuery = (
  args: RegistrationQueryVariables,
  options?: Pick<UseQueryOptions, 'enabled'>
): UseQueryResult<Registration> => {
  return useQuery<Registration, Error>(
    ['registration', args.id],
    () => fetchRegistration(args),
    options
  );
};
