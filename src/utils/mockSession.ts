/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { faker } from '@faker-js/faker';
import merge from 'lodash/merge';

import {
  TEST_ACCESS_TOKEN,
  TEST_API_TOKEN,
  TEST_REFRESH_TOKEN,
} from '../domain/auth/constants';
import { TEST_USER_ID } from '../domain/user/constants';
import { ExtendedSession, OidcUser } from '../types';

export const fakeOidcUser = (overrides?: Partial<OidcUser>): OidcUser =>
  merge<OidcUser, typeof overrides>(
    {
      id: TEST_USER_ID,
      name: faker.name.firstName(),
      email: faker.internet.email(),
      email_verified: true,
      family_name: faker.name.lastName(),
      given_name: faker.name.firstName(),
      nickname: faker.name.firstName(),
    },
    overrides
  );

export const sessionDefaultValue: ExtendedSession = {
  accessToken: TEST_ACCESS_TOKEN,
  accessTokenExpires: 1664803843,
  apiTokens: { linkedevents: TEST_API_TOKEN },
  expires: '2022-11-02T13:10:14.577Z',
  refreshToken: TEST_REFRESH_TOKEN,
  user: fakeOidcUser(),
};

export const fakeAuthenticatedSession = (
  overrides?: Partial<ExtendedSession>
): ExtendedSession =>
  merge<ExtendedSession, typeof overrides>(
    { ...sessionDefaultValue },
    overrides
  );
