import { fakeSignupGroup } from '../../../utils/mockDataUtils';
import { signup } from '../../signup/__mocks__/signup';
import { TEST_SIGNUP_GROUP_ID } from '../constants';

const signupGroup = fakeSignupGroup({
  id: TEST_SIGNUP_GROUP_ID,

  signups: [signup],
});

export { signupGroup };
