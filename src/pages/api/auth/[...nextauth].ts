import { NextApiRequest, NextApiResponse } from 'next';
import absoluteUrl from 'next-absolute-url';
import NextAuth, { NextAuthOptions } from 'next-auth';
import { OAuthConfig } from 'next-auth/providers/oauth';

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
    // Configure one or more authentication providers
    providers: [
      {
        id: 'tunnistamo',
        name: 'Tunnistamo',
        type: 'oauth',
        wellKnown: 'https://api.hel.fi/sso/.well-known/openid-configuration',
        authorization: {
          params: {
            redirect_uri: `${origin}/callback`,
            scope:
              'openid profile email https://api.hel.fi/auth/linkedeventsdev',
          },
        },
        client: {
          response_types: ['id_token token'],
        },
        checks: ['nonce', 'state'],
        idToken: true,
        clientId: 'linkedcomponents-ui-test',
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
      jwt({ token, account }) {
        if (account) {
          token.accessToken = account.access_token;
          token.expiresAt = account.expires_at;
        }

        return token;
      },
      session({ session, token }) {
        session.accessToken = token.accessToken;
        session.expiresAt = token.expiresAt;

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
