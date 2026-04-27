import { APITokens, OidcUser, RefreshTokenResponse } from '../../../types';
import {
  fakeAuthenticatedSession,
  fakeOidcUser,
} from '../../../utils/mockSession';
import { FetchError } from '../../app/fetch/fetchError';
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
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ access_token: apiToken }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await getApiTokensRequest({
      accessToken,
      linkedEventsApiScope,
      url: apiTokensUrl,
    });

    expect(result).toEqual(apiTokenResponse);
    expect(mockFetch).toHaveBeenCalledWith(
      apiTokensUrl,
      expect.objectContaining({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: expect.any(URLSearchParams),
      })
    );
    const calledBody: URLSearchParams = mockFetch.mock.calls[0][1].body;
    expect(calledBody.get('audience')).toBe(linkedEventsApiScope);
    expect(calledBody.get('grant_type')).toBe(
      'urn:ietf:params:oauth:grant-type:uma-ticket'
    );
    expect(calledBody.get('permission')).toBe('#access');
  });

  it('should throw FetchError when response is not ok', async () => {
    const errorData = { detail: 'Unauthorized' };
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: () => Promise.resolve(errorData),
    });
    vi.stubGlobal('fetch', mockFetch);

    await expect(
      getApiTokensRequest({
        accessToken,
        linkedEventsApiScope,
        url: apiTokensUrl,
      })
    ).rejects.toThrow(FetchError);

    await expect(
      getApiTokensRequest({
        accessToken,
        linkedEventsApiScope,
        url: apiTokensUrl,
      })
    ).rejects.toMatchObject({
      status: 401,
      data: errorData,
      message: 'Unauthorized',
    });
  });
});

describe('refreshAccessTokenRequest function', () => {
  it('should refresh access token', async () => {
    const apiTokenResponse: RefreshTokenResponse = {
      access_token: accessToken,
      expires_in: 3600,
      id_token: 'id-token',
      refresh_token: refreshToken,
      token_type: 'type',
    };
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ...apiTokenResponse }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await refreshAccessTokenRequest({
      clientId,
      clientSecret,
      refreshToken,
      url: tokenUrl,
    });

    expect(mockFetch).toHaveBeenCalledWith(
      tokenUrl,
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: expect.any(URLSearchParams),
      })
    );
    const calledBody: URLSearchParams = mockFetch.mock.calls[0][1].body;
    expect(calledBody.get('client_id')).toBe(clientId);
    expect(calledBody.get('client_secret')).toBe(clientSecret);
    expect(calledBody.get('grant_type')).toBe('refresh_token');
    expect(calledBody.get('refresh_token')).toBe(refreshToken);
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
