import {
  QueryClient,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';

import { WebStoreOrder, WebStoreOrderQueryVariables } from './types';
import { fetchWebStoreOrder } from './utils';

export const prefetchWebStoreOrderQuery = ({
  args,
  queryClient,
}: {
  queryClient: QueryClient;
  args: WebStoreOrderQueryVariables;
}): Promise<void> => {
  return queryClient.prefetchQuery({
    queryKey: ['order', args.id],
    queryFn: () => fetchWebStoreOrder(args),
  });
};

export const useWebStoreOrderQuery = ({
  args,
  options,
}: {
  args: WebStoreOrderQueryVariables;
  options?: Pick<UseQueryOptions, 'enabled' | 'retry'>;
}): UseQueryResult<WebStoreOrder> => {
  return useQuery<WebStoreOrder, Error>({
    queryKey: ['order', args.id],
    queryFn: () => fetchWebStoreOrder(args),
    ...options,
  });
};
