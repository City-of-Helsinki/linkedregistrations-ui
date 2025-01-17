import { faker } from '@faker-js/faker';
import merge from 'lodash/merge';

import { TEST_API_TOKEN } from '../domain/auth/constants';
import { TEST_USER_ID } from '../domain/user/constants';
import { ExtendedSession, OidcUser } from '../types';

export const fakeOidcUser = (overrides?: Partial<OidcUser>): OidcUser =>
  merge<OidcUser, typeof overrides>(
    {
      id: TEST_USER_ID,
      name: faker.person.firstName(),
      email: faker.internet.email(),
      email_verified: true,
      family_name: faker.person.lastName(),
      given_name: faker.person.firstName(),
      nickname: faker.person.firstName(),
    },
    overrides
  );

export const sessionDefaultValue: ExtendedSession = {
  apiTokens: { linkedevents: TEST_API_TOKEN },
  expires: '2022-11-02T13:10:14.577Z',
  user: fakeOidcUser(),
};

export const fakeAuthenticatedSession = (
  overrides?: Partial<ExtendedSession>
): ExtendedSession =>
  merge<ExtendedSession, typeof overrides>(
    { ...sessionDefaultValue },
    overrides
  );
