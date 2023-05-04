import getServerRuntimeConfig from '../getServerRuntimeConfig';
import { mockConfig } from '../mockNextJsConfig';

const serverRuntimeConfig = {
  env: 'development',
  oidcApiTokensUrl: 'https://tunnistamo-backend:8000/api-tokens',
  oidcClientId: 'linkedregistrations-ui',
  oidcClientSecret: 'secret',
  oidcIssuer: 'https://tunnistamo-backend:8000',
  oidcLinkedEventsApiScope: 'linkedevents',
  oidcTokenUrl: 'https://tunnistamo-backend:8000/token',
};

describe('getServerRuntimeConfig function', () => {
  it('should return server runtime config', () => {
    mockConfig({}, serverRuntimeConfig);
    expect(getServerRuntimeConfig()).toEqual(serverRuntimeConfig);
  });

  const cases: [Record<string, string>][] = [
    [{ ...serverRuntimeConfig, env: '' }],
    [{ ...serverRuntimeConfig, oidcApiTokensUrl: '' }],
    [{ ...serverRuntimeConfig, oidcClientId: '' }],
    [{ ...serverRuntimeConfig, oidcClientSecret: '' }],
    [{ ...serverRuntimeConfig, oidcIssuer: '' }],
    [{ ...serverRuntimeConfig, oidcLinkedEventsApiScope: '' }],
    [{ ...serverRuntimeConfig, oidcTokenUrl: '' }],
  ];

  it.each(cases)(
    'should throw error if an server runtime variable is missing',
    (serverRuntimeConfig) => {
      mockConfig({}, serverRuntimeConfig);
      expect(getServerRuntimeConfig).toThrow(
        'Invalid configuration. Some required server runtime variable are missing'
      );
    }
  );
});
