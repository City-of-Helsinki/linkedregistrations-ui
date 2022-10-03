/* eslint-disable no-console */
import axios, { AxiosResponse } from 'axios';
import { deleteCookie, getCookie, setCookie } from 'cookies-next';
import { OptionsType } from 'cookies-next/lib/types';

import getUnixTime from '../../utils/getUnixTime';
import {
  API_SCOPE,
  API_TOKEN_EXPIRATION_TIME,
  API_TOKEN_NOTIFICATION_TIME,
  OIDC_API_TOKEN_ENDPOINT,
} from './constants';

const storageKey = `oidc.api-token.${API_SCOPE}`;

export const getApiTokenFromCookie = (options?: OptionsType): string | null =>
  (getCookie(storageKey, options) as string | null) ?? null;

export const setApiTokenToCookie = (
  accessToken: string,
  options?: OptionsType
): void => setCookie(storageKey, accessToken, options);

export const clearApiTokenFromCookie = (options?: OptionsType): void =>
  deleteCookie(storageKey, options);

export const fetchApiToken = async ({
  accessToken,
}: {
  accessToken: string;
}): Promise<string | null> => {
  try {
    const res: AxiosResponse = await axios.get(OIDC_API_TOKEN_ENDPOINT, {
      headers: { Authorization: `bearer ${accessToken}` },
    });

    const apiToken = res.data[API_SCOPE];
    return apiToken;
  } catch (e) {
    console.error(`Failed to fetch api token with error ${e}`);
    return null;
  }
};

export const getApiTokenExpirationTime = (): number =>
  getUnixTime(new Date()) + API_TOKEN_EXPIRATION_TIME;

export const isApiTokenExpiring = (expirationTime: number | null): boolean =>
  Boolean(
    expirationTime &&
      getUnixTime(new Date()) > expirationTime - API_TOKEN_NOTIFICATION_TIME
  );
