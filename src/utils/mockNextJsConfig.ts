import * as nextConfig from 'next/config';

const getConfig = jest.spyOn(nextConfig, 'default');

export const mockConfig = (
  publicRuntimeConfig: Record<string, string>,
  serverRuntimeConfig: Record<string, string>
) => {
  getConfig.mockImplementation(() => ({
    publicRuntimeConfig,
    serverRuntimeConfig,
  }));
};

export const mockDefaultConfig = () => {
  mockConfig(
    { linkedEventsApiBaseUrl: 'https://linkedevents-backend:8000/v1' },
    {
      env: 'development',
      oidcIssuer: 'https://tunnistamo-backend:8000',
      oidcClientId: 'linkedregistrations-ui',
      oidcClientSecret: 'secret',
      oidcApiTokensUrl: 'https://tunnistamo-backend:8000/api-tokens',
      oidcLinkedEventsApiScope: 'linkedevents',
      oidcTokenUrl: 'https://tunnistamo-backend:8000/token',
    }
  );
};
