import getPublicRuntimeConfig from '../getPublicRuntimeConfig';
import { mockConfig } from '../mockNextJsConfig';

const publicRuntimeConfig = {
  linkedEventsApiBaseUrl: 'https://linkedevents-backend:8000/v1',
};

describe('getPublicRuntimeConfig function', () => {
  it('should return public runtime config', () => {
    mockConfig(publicRuntimeConfig, {});
    expect(getPublicRuntimeConfig()).toEqual(publicRuntimeConfig);
  });

  const cases: [Record<string, string>][] = [
    [{ ...publicRuntimeConfig, linkedEventsApiBaseUrl: '' }],
  ];

  it.each(cases)(
    'should throw error if and public runtime variable is missing',
    (publicRuntimeConfig) => {
      mockConfig(publicRuntimeConfig, {});
      expect(getPublicRuntimeConfig).toThrow(
        'Invalid configuration. Some required public runtime variable are missing'
      );
    }
  );
});
