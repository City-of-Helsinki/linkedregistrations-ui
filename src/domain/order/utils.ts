import getPublicRuntimeConfig from '../../utils/getPublicRuntimeConfig';
import { callGet } from '../app/fetch/fetchClient';
import { FetchError } from '../app/fetch/fetchError';

import { WebStoreOrder, WebStoreOrderQueryVariables } from './types';

export const fetchWebStoreOrder = async (
  args: WebStoreOrderQueryVariables
): Promise<WebStoreOrder> => {
  const { webStoreApiBaseUrl } = getPublicRuntimeConfig();

  try {
    const { data } = await callGet({
      config: {
        baseURL: webStoreApiBaseUrl,
        headers: { user: args.user },
      },
      session: null,
      url: webStoreOrderPathBuilder(args),
    });
    return data;
  } catch (error) {
    throw new Error(JSON.stringify((error as FetchError).data), {
      cause: error,
    });
  }
};

export const webStoreOrderPathBuilder = (
  args: WebStoreOrderQueryVariables
): string => {
  const { id } = args;
  return `/order/${id}/`;
};
