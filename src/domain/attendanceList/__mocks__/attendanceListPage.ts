import range from 'lodash/range';
import { rest } from 'msw';

import { fakeRegistration, fakeSignups } from '../../../utils/mockDataUtils';
import { event } from '../../event/__mocks__/event';
import { TEST_REGISTRATION_ID } from '../../registration/constants';
import { Registration } from '../../registration/types';
import { PRESENCE_STATUS } from '../../signup/constants';

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

const mockedRegistrationWithoutUserAccessResponse = rest.get(
  `*/registration/${registrationId}/`,
  (req, res, ctx) =>
    res(
      ctx.status(200),
      ctx.json({ ...registration, has_registration_user_access: false })
    )
);

export {
  mockedRegistrationWithUserAccessResponse,
  mockedRegistrationWithoutUserAccessResponse,
  patchedSignup,
  registration,
  registrationId,
  signupNames,
};
