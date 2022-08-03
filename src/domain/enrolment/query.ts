import {
  QueryClient,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';

import { Enrolment, EnrolmentQueryVariables } from './types';
import { fetchEnrolment } from './utils';

/* istanbul ignore next */
export const fetchEnrolmentQuery = (
  queryClient: QueryClient,
  args: EnrolmentQueryVariables
): Promise<Enrolment> => {
  return queryClient.fetchQuery(['enrolment', args.cancellationCode], () =>
    fetchEnrolment(args)
  );
};

/* istanbul ignore next */
export const prefetchEnrolmentQuery = (
  queryClient: QueryClient,
  args: EnrolmentQueryVariables
): Promise<void> => {
  return queryClient.prefetchQuery(['enrolment', args.cancellationCode], () =>
    fetchEnrolment(args)
  );
};

export const useEnrolmentQuery = (
  args: EnrolmentQueryVariables,
  options?: Pick<UseQueryOptions, 'enabled'>
): UseQueryResult<Enrolment> => {
  return useQuery<Enrolment, Error>(
    ['enrolment', args.cancellationCode],
    () => fetchEnrolment(args),
    options
  );
};
