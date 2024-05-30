import {
  QueryClient,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';

import { WebStorePayment, WebStorePaymentQueryVariables } from './types';
import { fetchWebStorePayment } from './utils';

export const prefetchWebStorePaymentQuery = ({
  args,
  queryClient,
}: {
  queryClient: QueryClient;
  args: WebStorePaymentQueryVariables;
}): Promise<void> => {
  return queryClient.prefetchQuery({
    queryKey: ['payment', args.id],
    queryFn: () => fetchWebStorePayment(args),
  });
};

export const useWebStorePaymentQuery = ({
  args,
  options,
}: {
  args: WebStorePaymentQueryVariables;
  options?: Pick<UseQueryOptions, 'enabled' | 'retry'>;
}): UseQueryResult<WebStorePayment> => {
  return useQuery<WebStorePayment, Error>({
    queryKey: ['payment', args.id],
    queryFn: () => fetchWebStorePayment(args),
    ...options,
  });
};
