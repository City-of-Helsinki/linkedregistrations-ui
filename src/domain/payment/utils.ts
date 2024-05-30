import { AxiosError } from 'axios';

import getPublicRuntimeConfig from '../../utils/getPublicRuntimeConfig';
import { callGet } from '../app/axios/axiosClient';

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
    throw Error(JSON.stringify((error as AxiosError).response?.data));
  }
};

export const webStorePaymentPathBuilder = (
  args: WebStorePaymentQueryVariables
): string => {
  const { id } = args;
  return `/payment/${id}/`;
};
