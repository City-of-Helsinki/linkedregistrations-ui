import axios, { AxiosRequestConfig } from 'axios';
import { NextPageContext } from 'next';

import { LINKED_EVENTS_URL } from '../../../constants';
import { getApiTokenFromCookie } from '../../auth/utils';

const axiosClient = axios.create({
  baseURL: LINKED_EVENTS_URL,
  headers: { 'Content-Type': 'application/json' },
});

const getRequestConfig = (
  config?: AxiosRequestConfig,
  ctx?: Pick<NextPageContext, 'req' | 'res'>
): AxiosRequestConfig | undefined => {
  const token = getApiTokenFromCookie(ctx);

  return token
    ? {
        ...config,
        headers: { ...config?.headers, Authorization: `bearer ${token}` },
      }
    : config;
};

export const callDelete = (
  url: string,
  config?: AxiosRequestConfig,
  ctx?: Pick<NextPageContext, 'req' | 'res'>
) => {
  return axiosClient.delete(url, getRequestConfig(config, ctx));
};

export const callGet = (
  url: string,
  config?: AxiosRequestConfig,
  ctx?: Pick<NextPageContext, 'req' | 'res'>
) => {
  return axiosClient.get(url, getRequestConfig(config, ctx));
};

export const callPost = (
  url: string,
  data: string,
  config?: AxiosRequestConfig,
  ctx?: Pick<NextPageContext, 'req' | 'res'>
) => {
  return axiosClient.post(url, data, getRequestConfig(config, ctx));
};

export default axiosClient;
