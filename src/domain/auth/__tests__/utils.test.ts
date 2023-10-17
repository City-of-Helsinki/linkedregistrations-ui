import mockAxios from 'axios';

import { APITokens, OidcUser, RefreshTokenResponse } from '../../../types';
import { fakeUser } from '../../../utils/mockDataUtils';
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

    await expect(axiosFn).toHaveBeenCalledWith(apiTokensUrl, undefined, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      responseType: 'json',
    });
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
  it('should return correct user first name', () => {
    const user = fakeUser({ display_name: 'Username', first_name: 'User' });
    const session = fakeAuthenticatedSession({
      user: fakeOidcUser({ email: 'test@email.com' }),
    });
    expect(getUserFirstName({ user, session })).toBe('User');
    expect(
      getUserFirstName({ user: { ...user, first_name: '' }, session })
    ).toBe('Username');
    expect(
      getUserFirstName({
        user: { ...user, display_name: '', first_name: '' },
        session,
      })
    ).toBe('test@email.com');
    expect(
      getUserFirstName({
        user: { ...user, display_name: '', first_name: '' },
        session: {
          ...session,
          user: { ...session.user, email: '' } as OidcUser,
        },
      })
    ).toBe('');
  });
});

describe('getUserName function', () => {
  it('should return correct userame', () => {
    const user = fakeUser({ display_name: 'Username' });
    const session = fakeAuthenticatedSession({
      user: fakeOidcUser({ email: 'test@email.com' }),
    });
    expect(getUserName({ user, session })).toBe('Username');
    expect(
      getUserName({
        user: { ...user, display_name: '' },
        session,
      })
    ).toBe('test@email.com');
    expect(
      getUserName({
        user: { ...user, display_name: '' },
        session: {
          ...session,
          user: { ...session.user, email: '' } as OidcUser,
        },
      })
    ).toBe('');
  });
});
