import subYears from 'date-fns/subYears';

import formatDate from '../../../utils/formatDate';
import { fakeSignup, fakeSignupGroup } from '../../../utils/mockDataUtils';
import { TEST_SIGNUP_ID } from '../../signup/constants';
import { TEST_SIGNUP_GROUP_ID } from '../constants';

const signupGroup = fakeSignupGroup({
  id: TEST_SIGNUP_GROUP_ID,

  signups: [
    fakeSignup({
      id: TEST_SIGNUP_ID,
      date_of_birth: formatDate(subYears(new Date(), 15), 'yyyy-MM-dd'),
      phone_number: '0441234567',
    }),
  ],
});

export { signupGroup };
