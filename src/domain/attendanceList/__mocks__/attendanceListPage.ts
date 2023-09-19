import range from 'lodash/range';
import { rest } from 'msw';

import { fakeRegistration, fakeSignups } from '../../../utils/mockDataUtils';
import { event } from '../../event/__mocks__/event';
import { TEST_REGISTRATION_ID } from '../../registration/constants';
import { Registration } from '../../registration/types';
import { PRESENCE_STATUS } from '../../signup/constants';
import { TEST_USER_EMAIL } from '../../user/constants';

const registrationId = TEST_REGISTRATION_ID;

const signupNames = range(1, 4).map((i) => ({
  firstName: 'First',
  lastName: `last ${i}`,
}));
const signups = fakeSignups(
  signupNames.length,
  signupNames.map(({ firstName, lastName }) => ({
    first_name: firstName,
    last_name: lastName,
  }))
).data;
const registrationOverrides: Partial<Registration> = {
  id: registrationId,
  event,
  registration_user_accesses: [
    { id: 1, email: TEST_USER_EMAIL, language: 'fi' },
  ],
  signups,
};

const registration = fakeRegistration(registrationOverrides);

const patchedSignup = {
  ...signups[0],
  presence_status: PRESENCE_STATUS.Present,
};

const mockedRegistrationWithUserAccessResponse = rest.get(
  `*/registration/${registrationId}/`,
  (req, res, ctx) => res(ctx.status(200), ctx.json(registration))
);

export {
  mockedRegistrationWithUserAccessResponse,
  patchedSignup,
  registration,
  registrationId,
  signupNames,
};
