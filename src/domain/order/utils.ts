import { AxiosError } from 'axios';

import getPublicRuntimeConfig from '../../utils/getPublicRuntimeConfig';
import { callGet } from '../app/axios/axiosClient';

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
    throw Error(JSON.stringify((error as AxiosError).response?.data));
  }
};

export const webStoreOrderPathBuilder = (
  args: WebStoreOrderQueryVariables
): string => {
  const { id } = args;
  return `/order/${id}/`;
};
