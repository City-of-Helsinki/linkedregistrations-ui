import getPublicRuntimeConfig from '../getPublicRuntimeConfig';
import { mockConfig } from '../mockNextJsConfig';

const publicRuntimeConfig = {
  linkedEventsApiBaseUrl: 'https://linkedevents-backend:8000/v1',
  webStoreApiBaseUrl: 'https://payment-test.com/v1',
  attendanceListLoginMethods: 'suomi_fi',
  signupsLoginMethods: 'helsinki_tunnus,helsinkiad',
};

const expectedPublicRuntimeConfig = {
  linkedEventsApiBaseUrl: 'https://linkedevents-backend:8000/v1',
  webStoreApiBaseUrl: 'https://payment-test.com/v1',
  attendanceListLoginMethods: ['suomi_fi'],
  signupsLoginMethods: ['helsinki_tunnus', 'helsinkiad'],
};

describe('getPublicRuntimeConfig function', () => {
  it('should return public runtime config', () => {
    mockConfig(publicRuntimeConfig, {});
    expect(getPublicRuntimeConfig()).toEqual(expectedPublicRuntimeConfig);
  });

  const cases: [Record<string, string>][] = [
    [{ ...publicRuntimeConfig, linkedEventsApiBaseUrl: '' }],
    [{ ...publicRuntimeConfig, webStoreApiBaseUrl: '' }],
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
