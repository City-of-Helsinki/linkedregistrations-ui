import { vi } from 'vitest';

import getServerRuntimeConfig from '../getServerRuntimeConfig';

const serverRuntimeConfig = {
  env: 'development',
  oidcApiTokensUrl:
    'https://tunnistus.hel.fi/auth/realms/helsinki-tunnistus/protocol/openid-connect/token',
  oidcClientId: 'linkedregistrations-ui',
  oidcClientSecret: 'secret',
  oidcIssuer: 'https://tunnistus.hel.fi/auth/realms/helsinki-tunnistus',
  oidcLinkedEventsApiScope: 'linkedevents',
};

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('getServerRuntimeConfig function', () => {
  it('should return server runtime config', () => {
    vi.stubEnv('NEXT_ENV', serverRuntimeConfig.env);
    vi.stubEnv('OIDC_API_TOKENS_URL', serverRuntimeConfig.oidcApiTokensUrl);
    vi.stubEnv('OIDC_CLIENT_ID', serverRuntimeConfig.oidcClientId);
    vi.stubEnv('OIDC_CLIENT_SECRET', serverRuntimeConfig.oidcClientSecret);
    vi.stubEnv('OIDC_ISSUER', serverRuntimeConfig.oidcIssuer);
    vi.stubEnv(
      'OIDC_LINKED_EVENTS_API_SCOPE',
      serverRuntimeConfig.oidcLinkedEventsApiScope
    );
    expect(getServerRuntimeConfig()).toEqual(serverRuntimeConfig);
  });

  const cases: [Record<string, string>][] = [
    [{ ...serverRuntimeConfig, env: '' }],
    [{ ...serverRuntimeConfig, oidcApiTokensUrl: '' }],
    [{ ...serverRuntimeConfig, oidcClientId: '' }],
    [{ ...serverRuntimeConfig, oidcClientSecret: '' }],
    [{ ...serverRuntimeConfig, oidcIssuer: '' }],
    [{ ...serverRuntimeConfig, oidcLinkedEventsApiScope: '' }],
  ];

  it.each(cases)(
    'should throw error if an server runtime variable is missing',
    (serverRuntimeConfig) => {
      vi.stubEnv('NEXT_ENV', serverRuntimeConfig.env);
      vi.stubEnv('OIDC_API_TOKENS_URL', serverRuntimeConfig.oidcApiTokensUrl);
      vi.stubEnv('OIDC_CLIENT_ID', serverRuntimeConfig.oidcClientId);
      vi.stubEnv('OIDC_CLIENT_SECRET', serverRuntimeConfig.oidcClientSecret);
      vi.stubEnv('OIDC_ISSUER', serverRuntimeConfig.oidcIssuer);
      vi.stubEnv(
        'OIDC_LINKED_EVENTS_API_SCOPE',
        serverRuntimeConfig.oidcLinkedEventsApiScope
      );
      expect(getServerRuntimeConfig).toThrow(
        'Invalid configuration. Some required server runtime variable are missing'
      );
    }
  );
});
