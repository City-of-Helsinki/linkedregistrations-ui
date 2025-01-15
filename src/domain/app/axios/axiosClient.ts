import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import * as AxiosLogger from 'axios-logger';

import { ExtendedSession } from '../../../types';
import getPublicRuntimeConfig from '../../../utils/getPublicRuntimeConfig';
import isTestEnv from '../../../utils/isTestEnv';

const getAxiosClient = () => {
  const { linkedEventsApiBaseUrl } = getPublicRuntimeConfig();

  return axios.create({
    baseURL: linkedEventsApiBaseUrl,
    headers: { 'Content-Type': 'application/json' },
  });
};

const axiosClient = getAxiosClient();

/* istanbul ignore next */
if (!isTestEnv) {
  const loggerConfig = {
    data: false,
    dateFormat: 'isoDateTime',
  };

  // Add a request interceptor
  axiosClient.interceptors.request.use((request) => {
    return typeof window === 'undefined'
      ? AxiosLogger.requestLogger(request, loggerConfig)
      : request;
  });

  // Add a response interceptor
  axiosClient.interceptors.response.use(
    (response) => {
      return typeof window === 'undefined'
        ? AxiosLogger.responseLogger(response, loggerConfig)
        : response;
    },
    (err: AxiosError) => {
      if (typeof window === 'undefined') {
        return AxiosLogger.errorLogger(err, loggerConfig);
      } else {
        throw err;
      }
    }
  );
}

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

export const callPatch = async ({
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
  return axiosClient.patch(url, data, getRequestConfig({ config, session }));
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

export const callPut = async ({
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
  return axiosClient.put(url, data, getRequestConfig({ config, session }));
};

export default axiosClient;
