/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import '../tests/mockNextAuth';

import mockAxios from 'axios';
import { advanceTo, clear } from 'jest-date-mock';
import { Session, User } from 'next-auth';

import { SIGNOUT_REDIRECT } from '../constants';
import {
  getApiAccessTokens,
  getProfile,
  redirectCallback,
  jwtCallback,
  refreshAccessToken,
  sessionCallback,
} from '../pages/api/auth/[...nextauth]';
import {
  ApiTokenResponse,
  ExtendedJWT,
  RefreshTokenResponse,
  TunnistamoAccount,
} from '../types';
import { mockDefaultConfig } from '../utils/mockNextJsConfig';

afterEach(() => {
  clear();
  jest.resetAllMocks();
});

beforeEach(() => {
  mockDefaultConfig();
});

const accessToken = 'access-token';
const refreshToken = 'refresh-token';

const session: Session = {
  expires: '2021-02-22T18:00:00.000000Z',
};

const token: ExtendedJWT = {
  name: 'Test user',
  accessToken: accessToken,
  accessTokenExpires: 1682531200000,
  apiTokens: { linkedevents: 'api-token' },
  idToken: 'id-token',
  refreshToken,
  user: {
    email_verified: true,
    family_name: 'family-name',
    given_name: 'given-name',
    id: 'user-id',
    nickname: 'nickname',
  },
};

const account: TunnistamoAccount = {
  access_token: accessToken,
  expires_at: 123,
  id_token: 'id-token',
  provider: 'provider',
  providerAccountId: 'provider-account-id',
  refresh_token: refreshToken,
  token_type: 'bearer',
  type: 'oauth',
};

const user: User = {
  id: 'user:id',
};

const apiTokenResponse: ApiTokenResponse = {
  access_token: 'api-token',
  id_token: 'id-token',
  refresh_token: refreshToken,
  token_type: 'type',
  expires_in: 3600,
};

const refreshResponse: RefreshTokenResponse = {
  ...apiTokenResponse,
  access_token: 'refreshed-api-token',
};

const testTokenUrl = 'https://test.fi';
const testApiTokenUrl =
  'https://tunnistus.hel.fi/auth/realms/helsinki-tunnistus/protocol/openid-connect/token';

const mockTokenResonses = () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({ token_endpoint: testTokenUrl }),
    })
  ) as any;
  mockAxios.post = jest.fn().mockImplementation(async (url) => {
    switch (url) {
      case testTokenUrl:
        return { data: refreshResponse };
      case testApiTokenUrl:
        return {
          data: { ...apiTokenResponse, access_token: 'refreshed-api-token' },
        };
    }
  });
};

describe('getApiAccessTokens function', () => {
  test('should throw error if accessToken is not defined', async () => {
    await expect(
      async () => await getApiAccessTokens(undefined)
    ).rejects.toThrow('Access token not available. Cannot update');
  });

  test("should throw an error in api-tokens endpoint doesn't return api tokens", async () => {
    jest.spyOn(mockAxios, 'post').mockResolvedValue({ data: {} });

    await expect(
      async () => await getApiAccessTokens(accessToken)
    ).rejects.toThrow('No api-tokens present');
  });

  test('should return api tokens', async () => {
    jest
      .spyOn(mockAxios, 'post')
      .mockResolvedValue({ data: { ...apiTokenResponse } });

    const apiTokens = await getApiAccessTokens(accessToken);
    await expect(apiTokens).toEqual({ linkedevents: 'api-token' });
  });
});

describe('refreshAccessToken function', () => {
  test('should throw error if refreshToken is not defined', async () => {
    await expect(
      async () => await refreshAccessToken({ ...token, refreshToken: '' })
    ).rejects.toThrow('No refresh token present');
  });

  test('should return error if request to refresh access token fails', async () => {
    console.error = jest.fn();
    jest.spyOn(mockAxios, 'post').mockResolvedValue({ data: undefined });

    const { error } = await refreshAccessToken({ ...token, refreshToken });
    expect(error).toBe('RefreshAccessTokenError');
    expect(console.error).toBeCalled();
  });

  test('should return refreshed token', async () => {
    mockTokenResonses();

    const { apiTokens } = await refreshAccessToken({ ...token, refreshToken });
    expect(apiTokens?.linkedevents).toBe('refreshed-api-token');
  });
});

describe('getProfile function', () => {
  test('should getProfile with id', () => {
    expect(getProfile({ ...user, sub: 'user-sub' } as User)).toEqual({
      id: 'user-sub',
      sub: 'user-sub',
    });
  });
});

describe('jwtCallback function', () => {
  test('should return session after initial sign in', async () => {
    advanceTo('2023-01-01');

    jest
      .spyOn(mockAxios, 'post')
      .mockResolvedValue({ data: { ...apiTokenResponse } });

    const jwt = await jwtCallback({ token, user, account });

    expect(jwt).toEqual({
      accessToken: 'access-token',
      accessTokenExpires: 123000,
      apiTokens: {
        linkedevents: 'api-token',
      },
      idToken: 'id-token',
      refreshToken: 'refresh-token',
      user: {
        id: 'user:id',
      },
    });
  });

  test('should return original token if token is not expired', async () => {
    advanceTo('2023-01-01');

    jest
      .spyOn(mockAxios, 'post')
      .mockResolvedValue({ data: { ...apiTokenResponse } });

    const jwt = await jwtCallback({ token });

    expect(jwt).toEqual(token);
  });

  test('should return null if refreshing token fails', async () => {
    advanceTo('2023-01-01');

    jest
      .spyOn(mockAxios, 'post')
      .mockResolvedValue({ data: { ...apiTokenResponse } });

    const jwt = await jwtCallback({
      token: { ...token, accessTokenExpires: 1662531200000 },
    });

    expect(jwt).toEqual(null);
  });

  test('should refresh api token', async () => {
    advanceTo('2023-01-01');
    mockTokenResonses();

    const jwt = await jwtCallback({
      token: { ...token, accessTokenExpires: 1662531200000 },
    });

    expect(jwt.apiTokens.linkedevents).toEqual('refreshed-api-token');
  });
});

describe('sessionCallback function', () => {
  test('should return extended session', () => {
    expect(sessionCallback({ session, token, user })).toEqual({
      apiTokens: { linkedevents: 'api-token' },
      expires: '2021-02-22T18:00:00.000000Z',
      idToken: 'id-token',
      user: {
        email_verified: true,
        family_name: 'family-name',
        given_name: 'given-name',
        id: 'user-id',
        nickname: 'nickname',
      },
    });
  });

  test('should return original session if token is not defined', () => {
    expect(sessionCallback({ session, token: null as any, user })).toEqual(
      session
    );
  });
});

describe('redirectCallback function', () => {
  const baseUrl = 'http://localhost:3000';

  test('should return url from wellKnown endpoint', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({ end_session_endpoint: 'https://test.fi' }),
      })
    ) as any;
    expect(
      await redirectCallback({ url: `${baseUrl}${SIGNOUT_REDIRECT}`, baseUrl })
    ).toBe(
      'https://test.fi?post_logout_redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Flogout'
    );
  });

  test('should return correct url for relative url', async () => {
    expect(await redirectCallback({ url: `/test`, baseUrl })).toBe(
      `${baseUrl}/test`
    );
  });

  test('should return url if URLs are on the same origin', async () => {
    expect(await redirectCallback({ url: `${baseUrl}/test`, baseUrl })).toBe(
      `${baseUrl}/test`
    );
  });

  test('should return base url if URLs are on the different origin', async () => {
    expect(
      await redirectCallback({ url: `https://test.fi/test`, baseUrl })
    ).toBe(baseUrl);
  });
});
