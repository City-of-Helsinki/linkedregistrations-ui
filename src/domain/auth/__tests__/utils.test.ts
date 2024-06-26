import mockAxios from 'axios';

import { APITokens, OidcUser, RefreshTokenResponse } from '../../../types';
import {
  fakeAuthenticatedSession,
  fakeOidcUser,
} from '../../../utils/mockSession';
import {
  getApiTokensRequest,
  getUserFirstName,
  getUserName,
  refreshAccessTokenRequest,
} from '../utils';

const accessToken = 'access-token';
const apiToken = 'linked-events-api-token';
const apiTokensUrl = 'https://localhost:8000/api-tokens/';
const clientId = 'client-id';
const clientSecret = 'client-secret';
const linkedEventsApiScope = 'linkedevents';
const refreshToken = 'refresh-token';
const tokenUrl = 'https://localhost:8000/token/';

describe('getApiTokensRequest function', () => {
  it('should fetch api token', async () => {
    const apiTokenResponse: APITokens = { [linkedEventsApiScope]: apiToken };
    const axiosFn = jest
      .spyOn(mockAxios, 'post')
      .mockResolvedValue({ data: { ...apiTokenResponse } });

    await getApiTokensRequest({
      accessToken,
      linkedEventsApiScope,
      url: apiTokensUrl,
    });

    await expect(axiosFn).toHaveBeenCalledWith(
      apiTokensUrl,
      {
        audience: 'linkedevents',
        grant_type: 'urn:ietf:params:oauth:grant-type:uma-ticket',
        permission: '#access',
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        responseType: 'json',
      }
    );
  });
});

describe('getApiTokensRequest function', () => {
  it('should fetch api token', async () => {
    const apiTokenResponse: RefreshTokenResponse = {
      access_token: accessToken,
      expires_in: 3600,
      id_token: 'id-token',
      refresh_token: refreshToken,
      token_type: 'type',
    };
    const axiosFn = jest
      .spyOn(mockAxios, 'post')
      .mockResolvedValue({ data: { ...apiTokenResponse } });

    await refreshAccessTokenRequest({
      clientId,
      clientSecret,
      refreshToken,
      url: tokenUrl,
    });

    await expect(axiosFn).toHaveBeenCalledWith(
      tokenUrl,
      {
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      },
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        responseType: 'json',
      }
    );
  });
});

describe('getUserFirstName function', () => {
  const commonUser = fakeOidcUser({
    email: 'test@email.com',
    given_name: 'User',
    name: 'User name',
  });
  const testCases: [OidcUser | undefined, string][] = [
    [commonUser, 'User'],
    [{ ...commonUser, given_name: '' }, 'User name'],
    [{ ...commonUser, given_name: '', name: '' }, 'test@email.com'],
    [{ ...commonUser, email: '', given_name: '', name: '' }, ''],
    [null as unknown as undefined, ''],
  ];

  it.each(testCases)(
    'should return correct user first name, %o -> %s',
    (user, expectedName) => {
      const session = fakeAuthenticatedSession({ user });
      expect(getUserFirstName({ session })).toBe(expectedName);
    }
  );
});

describe('getUserName function', () => {
  const commonUser = fakeOidcUser({
    email: 'test@email.com',
    given_name: 'User',
    name: 'User name',
  });
  const testCases: [OidcUser | undefined, string][] = [
    [commonUser, 'User name'],
    [{ ...commonUser, name: '' }, 'test@email.com'],
    [{ ...commonUser, email: '', name: '' }, ''],
    [null as unknown as undefined, ''],
  ];

  it.each(testCases)(
    'should return correct username, %o -> %s',
    (user, expectedName) => {
      const session = fakeAuthenticatedSession({ user });
      expect(getUserName({ session })).toBe(expectedName);
    }
  );
});
