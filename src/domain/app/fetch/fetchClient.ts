import { ExtendedSession } from '../../../types';
import getPublicRuntimeConfig from '../../../utils/getPublicRuntimeConfig';
import isTestEnv from '../../../utils/isTestEnv';

import { FetchError } from './fetchError';

export interface RequestConfig {
  baseURL?: string;
  headers?: Record<string, string>;
  responseType?: 'json' | 'blob';
}

const getBaseUrl = () => getPublicRuntimeConfig().linkedEventsApiBaseUrl;

const request = async (
  url: string,
  options: RequestInit,
  responseType: RequestConfig['responseType'] = 'json',
  baseURL?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<{ data: any }> => {
  const resolvedBaseUrl = baseURL ?? getBaseUrl();
  const fullUrl = `${resolvedBaseUrl.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;

  /* istanbul ignore next */
  if (!isTestEnv && globalThis.window === undefined) {
    console.log(`[Request] ${options.method ?? 'GET'} ${fullUrl}`); // eslint-disable-line no-console
  }

  const response = await fetch(fullUrl, options);

  /* istanbul ignore next */
  if (!isTestEnv && globalThis.window === undefined) {
    // eslint-disable-next-line no-console
    console.log(
      `[Response] ${response.status} ${options.method ?? 'GET'} ${fullUrl}`
    );
  }

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new FetchError(response.statusText, response.status, data);
  }

  let data: unknown;

  if (responseType === 'blob') {
    data = await response.blob();
  } else {
    const text = await response.text();
    data = text.length > 0 ? JSON.parse(text) : null;
  }

  return { data };
};

const getLinkedEventsApiToken = (session: ExtendedSession | null) =>
  session?.apiTokens?.linkedevents;

const getRequestHeaders = ({
  config,
  session,
}: {
  config?: RequestConfig;
  session: ExtendedSession | null;
}): Record<string, string> => {
  const token = getLinkedEventsApiToken(session);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...config?.headers,
  };
  if (token) {
    headers['Authorization'] = `bearer ${token}`;
  }
  return headers;
};

export const callDelete = async ({
  config,
  session,
  url,
}: {
  config?: RequestConfig;
  session: ExtendedSession | null;
  url: string;
}) => {
  return request(
    url,
    { method: 'DELETE', headers: getRequestHeaders({ config, session }) },
    config?.responseType,
    config?.baseURL
  );
};

export const callGet = async ({
  config,
  session,
  url,
}: {
  config?: RequestConfig;
  session: ExtendedSession | null;
  url: string;
}) => {
  return request(
    url,
    { method: 'GET', headers: getRequestHeaders({ config, session }) },
    config?.responseType,
    config?.baseURL
  );
};

export const callPatch = async ({
  config,
  data,
  session,
  url,
}: {
  config?: RequestConfig;
  data: string;
  session: ExtendedSession | null;
  url: string;
}) => {
  return request(
    url,
    {
      method: 'PATCH',
      headers: getRequestHeaders({ config, session }),
      body: data,
    },
    config?.responseType,
    config?.baseURL
  );
};

export const callPost = async ({
  config,
  data,
  session,
  url,
}: {
  config?: RequestConfig;
  data: string;
  session: ExtendedSession | null;
  url: string;
}) => {
  return request(
    url,
    {
      method: 'POST',
      headers: getRequestHeaders({ config, session }),
      body: data,
    },
    config?.responseType,
    config?.baseURL
  );
};

export const callPut = async ({
  config,
  data,
  session,
  url,
}: {
  config?: RequestConfig;
  data: string;
  session: ExtendedSession | null;
  url: string;
}) => {
  return request(
    url,
    {
      method: 'PUT',
      headers: getRequestHeaders({ config, session }),
      body: data,
    },
    config?.responseType,
    config?.baseURL
  );
};
