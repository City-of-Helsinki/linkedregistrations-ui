import { beforeEach, vi } from 'vitest';
import getPublicRuntimeConfig from '../getPublicRuntimeConfig';

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

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('getPublicRuntimeConfig function', () => {
  it('should return public runtime config', () => {
    vi.stubEnv(
      'NEXT_PUBLIC_LINKED_EVENTS_URL',
      publicRuntimeConfig.linkedEventsApiBaseUrl
    );
    vi.stubEnv(
      'NEXT_PUBLIC_WEB_STORE_API_BASE_URL',
      publicRuntimeConfig.webStoreApiBaseUrl
    );
    vi.stubEnv(
      'NEXT_PUBLIC_ATTENDANCE_LIST_LOGIN_METHODS',
      publicRuntimeConfig.attendanceListLoginMethods
    );
    vi.stubEnv(
      'NEXT_PUBLIC_SIGNUPS_LOGIN_METHODS',
      publicRuntimeConfig.signupsLoginMethods
    );
    expect(getPublicRuntimeConfig()).toEqual(expectedPublicRuntimeConfig);
  });

  const cases: [Record<string, string>][] = [
    [{ ...publicRuntimeConfig, linkedEventsApiBaseUrl: '' }],
    [{ ...publicRuntimeConfig, webStoreApiBaseUrl: '' }],
  ];

  it.each(cases)(
    'should throw error if and public runtime variable is missing',
    (publicRuntimeConfig) => {
      vi.stubEnv(
        'NEXT_PUBLIC_LINKED_EVENTS_URL',
        publicRuntimeConfig.linkedEventsApiBaseUrl
      );
      vi.stubEnv(
        'NEXT_PUBLIC_WEB_STORE_API_BASE_URL',
        publicRuntimeConfig.webStoreApiBaseUrl
      );
      vi.stubEnv(
        'NEXT_PUBLIC_ATTENDANCE_LIST_LOGIN_METHODS',
        publicRuntimeConfig.attendanceListLoginMethods
      );
      vi.stubEnv(
        'NEXT_PUBLIC_SIGNUPS_LOGIN_METHODS',
        publicRuntimeConfig.signupsLoginMethods
      );
      expect(getPublicRuntimeConfig).toThrow(
        'Invalid configuration. Some required public runtime variable are missing'
      );
    }
  );
});
