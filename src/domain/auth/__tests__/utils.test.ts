/* eslint-disable no-console */
import mockAxios from 'axios';
import { advanceTo, clear } from 'jest-date-mock';

import { API_SCOPE, TEST_ACCESS_TOKEN, TEST_API_TOKEN } from '../constants';
import {
  clearApiTokenFromCookie,
  fetchApiToken,
  getApiTokenExpirationTime,
  getApiTokenFromCookie,
  isApiTokenExpiring,
  setApiTokenToCookie,
} from '../utils';

const accessToken = TEST_ACCESS_TOKEN;
const apiToken = TEST_API_TOKEN;

afterEach(() => {
  clear();
});

const axiosCalled = async ({
  accessToken,
  axiosFn,
}: {
  accessToken: string;
  axiosFn: jest.SpyInstance;
}) => {
  expect(axiosFn).toHaveBeenCalledWith(
    `${process.env.NEXT_PUBLIC_OIDC_AUTHORITY}/api-tokens/`,
    { headers: { Authorization: `bearer ${accessToken}` } }
  );
};

const apiTokenFetchSucceeded = async ({
  accessToken,
  axiosFn,
}: {
  accessToken: string;
  axiosFn: jest.SpyInstance;
}) => {
  axiosCalled({ accessToken, axiosFn });
};

const apiTokenFetchFailed = async ({
  accessToken,
  axiosFn,
}: {
  accessToken: string;
  axiosFn: jest.SpyInstance;
}) => {
  axiosCalled({ accessToken, axiosFn });
};

describe('fetchApiToken function', () => {
  it('should fetxh api token', async () => {
    const axiosGet = jest
      .spyOn(mockAxios, 'get')
      .mockResolvedValue({ data: { [API_SCOPE]: apiToken } });

    await fetchApiToken({ accessToken });

    await apiTokenFetchSucceeded({
      accessToken,
      axiosFn: axiosGet,
    });
  });

  it('should show toast error message when failing to renew api token', async () => {
    console.error = jest.fn();
    const error = new Error('error');

    const axiosGet = jest.spyOn(mockAxios, 'get').mockRejectedValue(error);

    await fetchApiToken({ accessToken });

    await apiTokenFetchFailed({
      accessToken,
      axiosFn: axiosGet,
    });

    expect(console.error).toBeCalledWith(
      `Failed to fetch api token with error ${error}`
    );
  });
});

describe('getApiTokenFromCookie function', () => {
  it('should store api token to session storage and get it from there', async () => {
    expect(getApiTokenFromCookie()).toBe(null);

    setApiTokenToCookie(apiToken);
    expect(getApiTokenFromCookie()).toBe(apiToken);

    clearApiTokenFromCookie();
    expect(getApiTokenFromCookie()).toBe(null);
  });
});

describe('getApiTokenExpirationTime function', () => {
  it('should get expiration time', async () => {
    advanceTo('2022-09-08');
    expect(getApiTokenExpirationTime()).toBe(1662595260);
  });
});

describe('isApiTokenExpiring', () => {
  const expirationTime = 1662595260;

  it('should return true', async () => {
    advanceTo('2022-09-08');
    expect(isApiTokenExpiring(expirationTime - 60)).toBe(true);
  });

  it('should return true', async () => {
    advanceTo('2022-09-08');

    expect(isApiTokenExpiring(null)).toBe(false);
    expect(isApiTokenExpiring(expirationTime - 59)).toBe(false);
  });
});
