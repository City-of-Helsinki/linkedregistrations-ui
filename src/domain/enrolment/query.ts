import {
  QueryClient,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';

import { ExtendedSession } from '../../types';
import { Enrolment, EnrolmentQueryVariables } from './types';
import { fetchEnrolment } from './utils';

export const fetchEnrolmentQuery = ({
  args,
  queryClient,
  session,
}: {
  args: EnrolmentQueryVariables;
  queryClient: QueryClient;
  session: ExtendedSession | null;
}): Promise<Enrolment> => {
  return queryClient.fetchQuery(['enrolment', args.cancellationCode], () =>
    fetchEnrolment(args, session)
  );
};

export const prefetchEnrolmentQuery = ({
  args,
  queryClient,
  session,
}: {
  args: EnrolmentQueryVariables;
  queryClient: QueryClient;
  session: ExtendedSession | null;
}): Promise<void> => {
  return queryClient.prefetchQuery(['enrolment', args.cancellationCode], () =>
    fetchEnrolment(args, session)
  );
};

export const useEnrolmentQuery = ({
  args,
  options,
  session,
}: {
  args: EnrolmentQueryVariables;
  options?: Pick<UseQueryOptions, 'enabled'>;
  session: ExtendedSession | null;
}): UseQueryResult<Enrolment> => {
  return useQuery<Enrolment, Error>(
    ['enrolment', args.cancellationCode],
    () => fetchEnrolment(args, session),
    options
  );
};
