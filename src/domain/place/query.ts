import { QueryClient, useQuery, UseQueryResult } from '@tanstack/react-query';

import { Place } from './types';
import { fetchPlace } from './utils';

/* istanbul ignore next */
export const prefetchPlaceQuery = (
  queryClient: QueryClient,
  id: string
): Promise<void> =>
  queryClient.prefetchQuery(['place', id], () => fetchPlace(id));

export const usePlaceQuery = (id: string): UseQueryResult<Place> => {
  return useQuery(['place', id], () => fetchPlace(id));
};
