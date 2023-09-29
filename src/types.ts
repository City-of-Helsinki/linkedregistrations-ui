/* eslint-disable @typescript-eslint/no-explicit-any */
import { DehydratedState } from '@tanstack/react-query';
import { Session, User as NextAuthUser } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import { SSRConfig } from 'next-i18next';

export type Language = 'en' | 'fi' | 'sv';

export type Error<T> = {
  key: string;
} & T;

export type OptionType = {
  label: string;
  value: string;
};

export type LEServerError =
  | string
  | Record<string, unknown>
  | Array<Record<string, unknown> | string>;

export type ServerErrorItem = {
  label: string;
  message: string;
};

export type FalsyType = false | null | undefined | '' | 0;

export type TunnistamoAccount = {
  provider: string;
  type: 'oauth';
  providerAccountId: string;
  access_token: string;
  refresh_token: string;
  token_type: 'bearer';
  expires_at: number;
  id_token: string;
};

export type TunnistamoProfile = {
  iss: string;
  sub: string;
  aud: string;
  exp: number;
  iat: number;
  auth_time: number;
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

export type OidcUser = Omit<NextAuthUser, 'image'> & {
  given_name: string;
  family_name: string;
  nickname: string;
  email_verified: boolean;
};

export type APITokens = {
  linkedevents: string;
};

type SessionExtensions = {
  accessToken?: string;
  accessTokenExpires?: number;
  apiTokens?: APITokens;
  refreshToken?: string;
  user?: OidcUser;
  error?: string;
};

export type ExtendedSession = Session & SessionExtensions;
export type ExtendedJWT = JWT & SessionExtensions;

export type RefreshTokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  id_token: string;
};

export type MutationCallbacks<SuccessResponseType = string> = {
  onError?: (error: any) => void;
  onSuccess?: (data?: SuccessResponseType) => void;
};

export type ExtendedSSRConfig = SSRConfig & {
  dehydratedState: DehydratedState;
  session: ExtendedSession | null;
};

export type TranslationNamespaces = Array<
  'attendanceList' | 'common' | 'reservation' | 'signup' | 'summary'
>;
