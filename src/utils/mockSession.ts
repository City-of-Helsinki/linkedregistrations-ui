/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { faker } from '@faker-js/faker';
import merge from 'lodash/merge';
import { Session } from 'next-auth';

import { TEST_ACCESS_TOKEN, TEST_API_TOKEN } from '../domain/auth/constants';
import { TEST_USER_ID } from '../domain/user/constants';

type SessionUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export const fakeSessionUser = (
  overrides?: Partial<SessionUser>
): SessionUser =>
  merge<SessionUser, typeof overrides>(
    {
      name: faker.name.firstName(),
      email: faker.internet.email(),
      image: null,
    },
    overrides
  );

export const sessionDefaultValue: Session = {
  user: fakeSessionUser(),
  expires: '2022-11-02T13:10:14.577Z',
  accessToken: TEST_ACCESS_TOKEN,
  accessTokenExpiresAt: 1664803843,
  apiToken: TEST_API_TOKEN,
  apiTokenExpiresAt: 1664802675,
  sub: TEST_USER_ID,
};

export const fakeAuthenticatedSession = (
  overrides?: Partial<Session>
): Session =>
  merge<Session, typeof overrides>({ ...sessionDefaultValue }, overrides);
