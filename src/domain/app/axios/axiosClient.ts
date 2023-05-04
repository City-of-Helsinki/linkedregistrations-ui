import axios, { AxiosRequestConfig } from 'axios';

import { ExtendedSession } from '../../../types';
import getPublicRuntimeConfig from '../../../utils/getPublicRuntimeConfig';

const getAxiosClient = () => {
  const { linkedEventsApiBaseUrl } = getPublicRuntimeConfig();

  return axios.create({
    baseURL: linkedEventsApiBaseUrl,
    headers: { 'Content-Type': 'application/json' },
  });
};

const axiosClient = getAxiosClient();

const getLinkedEventsApiToken = (session: ExtendedSession | null) =>
  session?.apiTokens?.linkedevents;

const getRequestConfig = ({
  config,
  session,
}: {
  config?: AxiosRequestConfig;
  session: ExtendedSession | null;
}): AxiosRequestConfig | undefined => {
  const token = getLinkedEventsApiToken(session);

  return token
    ? {
        ...config,
        headers: { ...config?.headers, Authorization: `bearer ${token}` },
      }
    : config;
};

export const callDelete = async ({
  config,
  session,
  url,
}: {
  config?: AxiosRequestConfig;
  session: ExtendedSession | null;
  url: string;
}) => {
  return axiosClient.delete(url, getRequestConfig({ config, session }));
};

export const callGet = async ({
  config,
  session,
  url,
}: {
  config?: AxiosRequestConfig;
  session: ExtendedSession | null;
  url: string;
}) => {
  return axiosClient.get(url, getRequestConfig({ config, session }));
};

export const callPost = async ({
  config,
  data,
  session,
  url,
}: {
  config?: AxiosRequestConfig;
  data: string;
  session: ExtendedSession | null;
  url: string;
}) => {
  return axiosClient.post(url, data, getRequestConfig({ config, session }));
};

export default axiosClient;
