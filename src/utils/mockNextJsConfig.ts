import { vi } from 'vitest';

export const mockConfig = (
  publicRuntimeConfig: Record<string, string>,
  serverRuntimeConfig: Record<string, string>
) => {
  const publicEnvMap: Record<string, string> = {
    linkedEventsApiBaseUrl: 'NEXT_PUBLIC_LINKED_EVENTS_URL',
    webStoreApiBaseUrl: 'NEXT_PUBLIC_WEB_STORE_API_BASE_URL',
    attendanceListLoginMethods: 'NEXT_PUBLIC_ATTENDANCE_LIST_LOGIN_METHODS',
    signupsLoginMethods: 'NEXT_PUBLIC_SIGNUPS_LOGIN_METHODS',
  };

  Object.entries(publicRuntimeConfig).forEach(([key, value]) => {
    const envKey = publicEnvMap[key] || `NEXT_PUBLIC_${key.toUpperCase()}`;
    vi.stubEnv(envKey, value);
  });

  const serverEnvMap: Record<string, string> = {
    env: 'NEXT_ENV',
    oidcApiTokensUrl: 'OIDC_API_TOKENS_URL',
    oidcClientId: 'OIDC_CLIENT_ID',
    oidcClientSecret: 'OIDC_CLIENT_SECRET',
    oidcIssuer: 'OIDC_ISSUER',
    oidcLinkedEventsApiScope: 'OIDC_LINKED_EVENTS_API_SCOPE',
  };

  Object.entries(serverRuntimeConfig).forEach(([key, value]) => {
    const envKey = serverEnvMap[key] || key.toUpperCase();
    vi.stubEnv(envKey, value);
  });
};

export const mockDefaultConfig = () => {
  mockConfig(
    {
      linkedEventsApiBaseUrl: 'https://linkedevents-backend:8000/v1',
      webStoreApiBaseUrl: 'https://payment-test.com/v1',
      attendanceListLoginMethods: 'suomi_fi',
      signupsLoginMethods: 'helsinki_tunnus,helsinkiad',
    },
    {
      env: 'development',
      oidcIssuer: 'https://tunnistus.hel.fi/auth/realms/helsinki-tunnistus',
      oidcClientId: 'linkedregistrations-ui',
      oidcClientSecret: 'secret',
      oidcApiTokensUrl:
        'https://tunnistus.hel.fi/auth/realms/helsinki-tunnistus/protocol/openid-connect/token',
      oidcLinkedEventsApiScope: 'linkedevents',
    }
  );
};
