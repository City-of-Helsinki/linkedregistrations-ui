import {
  QueryClient,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import { NextPageContext } from 'next';

import { Event, EventQueryVariables } from './types';
import { fetchEvent } from './utils';

/* istanbul ignore next */
export const fetchEventQuery = (
  queryClient: QueryClient,
  args: EventQueryVariables,
  ctx?: Pick<NextPageContext, 'req' | 'res'>
): Promise<Event> => {
  return queryClient.fetchQuery(['event', args.id], () =>
    fetchEvent(args, ctx)
  );
};

/* istanbul ignore next */
export const prefetchEventQuery = (
  queryClient: QueryClient,
  args: EventQueryVariables,
  ctx?: Pick<NextPageContext, 'req' | 'res'>
): Promise<void> => {
  return queryClient.prefetchQuery(['event', args.id], () =>
    fetchEvent(args, ctx)
  );
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
