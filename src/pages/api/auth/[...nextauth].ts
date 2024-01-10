import { NextApiRequest, NextApiResponse } from 'next';
import NextAuth, {
  Account,
  Awaitable,
  NextAuthOptions,
  Session,
  User,
} from 'next-auth';
import { JWT } from 'next-auth/jwt';
import { OAuthConfig } from 'next-auth/providers/oauth';

import { SIGNOUT_REDIRECT } from '../../../constants';
import { ROUTES } from '../../../domain/app/routes/constants';
import {
  getApiTokensRequest,
  refreshAccessTokenRequest,
} from '../../../domain/auth/utils';
import {
  APITokens,
  ExtendedJWT,
  ExtendedSession,
  OidcUser,
  TunnistamoAccount,
  TunnistamoProfile,
} from '../../../types';
import getServerRuntimeConfig from '../../../utils/getServerRuntimeConfig';

type JwtParams = {
  token: ExtendedJWT;
  user?: OidcUser;
  account: TunnistamoAccount;
};

type SessionParams = {
  token: ExtendedJWT;
  user: OidcUser;
  session: ExtendedSession;
};

const getWellKnown = () =>
  `${getServerRuntimeConfig().oidcIssuer}/.well-known/openid-configuration`;

export const getApiAccessTokens = async (
  accessToken: string | undefined
): Promise<APITokens> => {
  const { oidcLinkedEventsApiScope, oidcApiTokensUrl } =
    getServerRuntimeConfig();

  if (!accessToken) {
    throw new Error('Access token not available. Cannot update');
  }
  const apiTokens = await getApiTokensRequest({
    accessToken,
    linkedEventsApiScope: oidcLinkedEventsApiScope,
    url: oidcApiTokensUrl,
  });

  if (!apiTokens.linkedevents) {
    throw new Error('No api-tokens present');
  }

  return apiTokens;
};

export const refreshAccessToken = async (
  token: ExtendedJWT
): Promise<ExtendedJWT> => {
  const { oidcClientId, oidcClientSecret } = getServerRuntimeConfig();

  if (!token.refreshToken) {
    throw new Error('No refresh token present');
  }

  try {
    const { token_endpoint } = await (await fetch(getWellKnown())).json();
    const response = await refreshAccessTokenRequest({
      clientId: oidcClientId,
      clientSecret: oidcClientSecret,
      url: token_endpoint,
      refreshToken: token.refreshToken,
    });

    if (!response) {
      throw new Error('Unable to refresh tokens');
    }

    const apiTokens = await getApiAccessTokens(response.access_token);

    return {
      ...token,
      accessToken: response.access_token,
      accessTokenExpires: Date.now() + response.expires_in * 1000,
      refreshToken:
        response.refresh_token ??
        /* istanbul ignore next */
        token.refreshToken,
      apiTokens,
    };
  } catch (error) {
    // eslint-disable-next-line
    console.error(error);

    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
};

export const getProfile = (user: User): Awaitable<OidcUser> => {
  const profile = user as unknown as TunnistamoProfile;

  return { ...profile, id: profile.sub };
};

export const jwtCallback = async (params: {
  token: JWT;
  user?: User;
  account?: Account | null;
}) => {
  const { token, user, account } = params as JwtParams;
  // Initial sign in
  if (account && user) {
    const apiTokens = await getApiAccessTokens(account.access_token);
    return {
      accessToken: account.access_token,
      accessTokenExpires: account.expires_at * 1000,
      refreshToken: account.refresh_token,
      user,
      apiTokens,
    };
  }

  if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
    return token;
  }

  const refreshedToken = await refreshAccessToken(token);

  if (refreshedToken?.error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return undefined as any;
  }

  return refreshedToken;
};

export const sessionCallback = (params: {
  session: Session;
  user: User;
  token: JWT;
}): ExtendedSession => {
  const { session, token } = params as SessionParams;

  if (!token) return session;

  const { accessToken, accessTokenExpires, user, apiTokens } = token;

  return { ...session, accessToken, accessTokenExpires, user, apiTokens };
};

export const redirectCallback = async ({
  url,
  baseUrl,
}: {
  url: string;
  baseUrl: string;
}) => {
  // Allows relative callback URLs
  if (url.endsWith(SIGNOUT_REDIRECT)) {
    const { end_session_endpoint } = await (await fetch(getWellKnown())).json();
    return `${end_session_endpoint}?post_logout_redirect_uri=${encodeURIComponent(
      `${baseUrl}${ROUTES.LOGOUT}`
    )}`;
  }

  if (url.startsWith('/')) {
    return `${baseUrl}${url}`;
  }
  // Allows callback URLs on the same origin
  if (new URL(url).origin === baseUrl) {
    return url;
  }

  return baseUrl;
};

export const getNextAuthOptions = () => {
  const { env, oidcClientId, oidcClientSecret, oidcIssuer } =
    getServerRuntimeConfig();
  const wellKnown = `${oidcIssuer}/.well-known/openid-configuration`;

  const authOptions: NextAuthOptions = {
    providers: [
      {
        id: 'tunnistamo',
        name: 'Tunnistamo',
        type: 'oauth',
        wellKnown,
        authorization: {
          params: { response_type: 'code', scope: `openid profile email` },
        },
        checks: ['pkce', 'state'],
        idToken: true,
        clientId: oidcClientId,
        clientSecret: oidcClientSecret,
        profile: getProfile,
      } as OAuthConfig<User>,
    ],
    debug: env === 'development',
    callbacks: {
      jwt: jwtCallback,
      redirect: redirectCallback,
      session: sessionCallback,
    },
  };

  return authOptions;
};

export default function nextAuthApiHandler(
  req: NextApiRequest,
  res: NextApiResponse
): ReturnType<typeof NextAuth> {
  return NextAuth(req, res, getNextAuthOptions());
}
