import range from 'lodash/range';

import { fakeRegistration, fakeSignups } from '../../../utils/mockDataUtils';
import { event } from '../../event/__mocks__/event';
import { TEST_REGISTRATION_ID } from '../../registration/constants';
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
const registrationOverrides = {
  id: registrationId,
  event,
  signups,
};

const registration = fakeRegistration(registrationOverrides);

const patchedSignup = {
  ...signups[0],
  presence_status: PRESENCE_STATUS.Present,
};

export { patchedSignup, registration, registrationId, signupNames };
