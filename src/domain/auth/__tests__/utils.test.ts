import mockAxios from 'axios';

import { APITokens, RefreshTokenResponse } from '../../../types';
import { getApiTokensRequest, refreshAccessTokenRequest } from '../utils';

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
