import { NextApiRequest, NextApiResponse } from 'next';
import absoluteUrl from 'next-absolute-url';
import NextAuth, { NextAuthOptions } from 'next-auth';
import { OAuthConfig } from 'next-auth/providers/oauth';

import {
  fetchApiToken,
  getApiTokenExpirationTime,
  isApiTokenExpiring,
} from '../../../domain/auth/utils';

type User = {
  iss: string;
  sub: string;
  aud: string;
  exp: number;
  iat: number;
  auth_time: number;
  nonce: string;
  at_hash: string;
  name: string;
  given_name: string;
  family_name: string;
  nickname: string;
  email: string;
  email_verified: boolean;
  azp: string;
  sid: string;
  amr: string;
  loa: string;
};

export const getNextAuthOptions = (req: NextApiRequest) => {
  const { origin } = absoluteUrl(req);
  const authOptions: NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    // Configure one or more authentication providers
    providers: [
      {
        id: 'tunnistamo',
        name: 'Tunnistamo',
        type: 'oauth',
        wellKnown: `${process.env.NEXT_PUBLIC_OIDC_AUTHORITY}/.well-known/openid-configuration`,
        authorization: {
          params: {
            redirect_uri: `${origin}/callback`,
            scope: `openid profile email ${process.env.NEXT_PUBLIC_OIDC_API_SCOPE}`,
          },
        },
        client: {
          response_types: ['id_token token'],
        },
        checks: ['nonce', 'state'],
        idToken: true,
        clientId: process.env.NEXT_PUBLIC_OIDC_CLIENT_ID,
        profile(user) {
          return {
            id: user.sub,
            name: user.name,
            email: user.email,
          };
        },
      } as OAuthConfig<User>,
    ],
    callbacks: {
      async jwt({ token, account }) {
        if (account) {
          token.accessToken = account.access_token;
          token.accessTokenExpiresAt = account.expires_at;
        }

        if (token.accessToken) {
          if (
            !token.apiTokenExpiresAt ||
            isApiTokenExpiring(token.apiTokenExpiresAt as number)
          ) {
            try {
              const apiToken = await fetchApiToken({
                accessToken: token.accessToken as string,
              });
              token.apiToken = apiToken ?? null;
              token.apiTokenExpiresAt = getApiTokenExpirationTime();
            } catch (e) {
              token.apiToken = null;
              token.apiTokenExpiresAt = null;
            }
          }
        } else {
          token.apiToken = null;
          token.apiTokenExpiresAt = null;
        }

        return token;
      },
      async session({ session, token }) {
        session.accessToken = token.accessToken ?? null;
        session.accessTokenExpiresAt = token.accessTokenExpiresAt ?? null;
        session.apiToken = token.apiToken ?? null;
        session.apiTokenExpiresAt = token.apiTokenExpiresAt ?? null;
        session.sub = token.sub ?? null;

        if (session.user && !session.user?.image) {
          session.user.image = null;
        }

        return session;
      },
    },
  };

  return authOptions;
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return NextAuth(req, res, getNextAuthOptions(req));
}
