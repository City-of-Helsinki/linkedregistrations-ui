import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';

import { ExtendedSession } from '../../types';

import { Event, EventQueryVariables } from './types';
import { fetchEvent } from './utils';

export const useEventQuery = ({
  args,
  options,
  session,
}: {
  args: EventQueryVariables;
  options?: Pick<UseQueryOptions, 'enabled' | 'retry'>;
  session: ExtendedSession | null;
}): UseQueryResult<Event> => {
  return useQuery<Event, Error>({
    queryKey: ['event', args.id],
    queryFn: () => fetchEvent(args, session),
    ...options,
  });
};
