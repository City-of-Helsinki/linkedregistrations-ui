import { APITokens, ExtendedSession, RefreshTokenResponse } from '../../types';
import { FetchError } from '../app/fetch/fetchError';

export const getApiTokensRequest = async ({
  accessToken,
  linkedEventsApiScope,
  url,
}: {
  accessToken: string;
  linkedEventsApiScope: string;
  url: string;
}): Promise<APITokens> => {
  const body = new URLSearchParams({
    audience: linkedEventsApiScope,
    grant_type: 'urn:ietf:params:oauth:grant-type:uma-ticket',
    permission: '#access',
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new FetchError(response.statusText, response.status, data);
  }

  const responseData = await response.json();
  const linkedevents = responseData.access_token;

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
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new FetchError(response.statusText, response.status, data);
  }

  return response.json();
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
