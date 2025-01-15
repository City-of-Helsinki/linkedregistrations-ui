import axios from 'axios';

import { APITokens, ExtendedSession, RefreshTokenResponse } from '../../types';

export const getApiTokensRequest = async ({
  accessToken,
  linkedEventsApiScope,
  url,
}: {
  accessToken: string;
  linkedEventsApiScope: string;
  url: string;
}): Promise<APITokens> => {
  const response = await axios.post(
    url,
    {
      audience: linkedEventsApiScope,
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

  const linkedevents = response.data.access_token;

  return { linkedevents };
};

export const refreshAccessTokenRequest = async ({
  clientId,
  clientSecret,
  refreshToken,
  url,
}: {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  url: string;
}): Promise<RefreshTokenResponse> => {
  const response = await axios.post(
    url,
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

  return response.data;
};

export const getUserFirstName = ({
  session,
}: {
  session: ExtendedSession | null;
}): string => {
  if (!session?.user) {
    return '';
  }

  const { given_name, name, email } = session.user;
  return given_name || name || email || '';
};

export const getUserName = ({
  session,
}: {
  session: ExtendedSession | null;
}): string => {
  if (!session?.user) {
    return '';
  }

  const { name, email } = session.user;
  return name || email || '';
};
