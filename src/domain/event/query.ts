import {
  QueryClient,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';

import { Event, EventQueryVariables } from './types';
import { fetchEvent } from './utils';

/* istanbul ignore next */
export const fetchEventQuery = (
  queryClient: QueryClient,
  args: EventQueryVariables
): Promise<Event> => {
  return queryClient.fetchQuery(['event', args.id], () => fetchEvent(args));
};

/* istanbul ignore next */
export const prefetchEventQuery = (
  queryClient: QueryClient,
  args: EventQueryVariables
): Promise<void> => {
  return queryClient.prefetchQuery(['event', args.id], () => fetchEvent(args));
};

export const useEventQuery = (
  args: EventQueryVariables,
  options?: Pick<UseQueryOptions, 'enabled'>
): UseQueryResult<Event> => {
  return useQuery<Event, Error>(
    ['event', args.id],
    () => fetchEvent(args),
    options
  );
};
