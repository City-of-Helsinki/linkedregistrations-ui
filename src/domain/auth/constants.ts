export const API_SCOPE =
  process.env.NEXT_PUBLIC_OIDC_API_SCOPE ||
  'https://api.hel.fi/auth/linkedevents';

/** The number of seconds how long api token is valid */
export const API_TOKEN_EXPIRATION_TIME = 60;
/** The number of seconds before an api token is to renew api token */
export const API_TOKEN_NOTIFICATION_TIME = 1;
// Interval to check is api token expired (ms)
export const API_TOKEN_CHECK_INTERVAL = 5000;

export const OIDC_API_TOKEN_ENDPOINT = `${process.env.NEXT_PUBLIC_OIDC_AUTHORITY}/api-tokens/`;

export const TEST_ACCESS_TOKEN = 'access-token';
export const TEST_API_TOKEN = 'api-token';
