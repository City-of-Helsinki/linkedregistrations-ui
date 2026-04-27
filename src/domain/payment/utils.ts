import getPublicRuntimeConfig from '../../utils/getPublicRuntimeConfig';
import { callGet } from '../app/fetch/fetchClient';
import { FetchError } from '../app/fetch/fetchError';

import { WebStorePayment, WebStorePaymentQueryVariables } from './types';

export const fetchWebStorePayment = async (
  args: WebStorePaymentQueryVariables
): Promise<WebStorePayment> => {
  const { webStoreApiBaseUrl } = getPublicRuntimeConfig();

  try {
    const { data } = await callGet({
      config: {
        baseURL: webStoreApiBaseUrl,
        headers: { user: args.user },
      },
      session: null,
      url: webStorePaymentPathBuilder(args),
    });
    return data;
  } catch (error) {
    throw new Error(JSON.stringify((error as FetchError).data), {
      cause: error,
    });
  }
};

export const webStorePaymentPathBuilder = (
  args: WebStorePaymentQueryVariables
): string => {
  const { id } = args;
  return `/payment/${id}/`;
};
