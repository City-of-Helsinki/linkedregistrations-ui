import * as nextConfig from 'next/config';

export const mockConfig = (
  publicRuntimeConfig: Record<string, string>,
  serverRuntimeConfig: Record<string, string>
) => {
  nextConfig.setConfig({
    publicRuntimeConfig,
    serverRuntimeConfig,
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
