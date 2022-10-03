import {
  QueryClient,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import { NextPageContext } from 'next';

import { Registration, RegistrationQueryVariables } from './types';
import { fetchRegistration } from './utils';

/* istanbul ignore next */
export const fetchRegistrationQuery = (
  queryClient: QueryClient,
  args: RegistrationQueryVariables,
  ctx?: Pick<NextPageContext, 'req' | 'res'>
): Promise<Registration> => {
  return queryClient.fetchQuery(['registration', args.id], () =>
    fetchRegistration(args, ctx)
  );
};

/* istanbul ignore next */
export const prefetchRegistrationQuery = (
  queryClient: QueryClient,
  args: RegistrationQueryVariables,
  ctx?: Pick<NextPageContext, 'req' | 'res'>
): Promise<void> => {
  return queryClient.prefetchQuery(['registration', args.id], () =>
    fetchRegistration(args, ctx)
  );
};

export const useRegistrationQuery = (
  args: RegistrationQueryVariables,
  options?: Pick<UseQueryOptions, 'enabled' | 'retry'>
): UseQueryResult<Registration> => {
  return useQuery<Registration, Error>(
    ['registration', args.id],
    () => fetchRegistration(args),
    options
  );
};
