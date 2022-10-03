import { QueryClient, useQuery, UseQueryResult } from '@tanstack/react-query';
import { NextPageContext } from 'next';

import { Place } from './types';
import { fetchPlace } from './utils';

/* istanbul ignore next */
export const prefetchPlaceQuery = (
  queryClient: QueryClient,
  id: string,
  ctx?: Pick<NextPageContext, 'req' | 'res'>
): Promise<void> =>
  queryClient.prefetchQuery(['place', id], () => fetchPlace(id, ctx));

export const usePlaceQuery = (id: string): UseQueryResult<Place> => {
  return useQuery(['place', id], () => fetchPlace(id));
};
