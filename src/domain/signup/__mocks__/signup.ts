import subYears from 'date-fns/subYears';

import formatDate from '../../../utils/formatDate';
import { fakeSignup } from '../../../utils/mockDataUtils';
import { TEST_SIGNUP_ID } from '../constants';

const signup = fakeSignup({
  id: TEST_SIGNUP_ID,
  date_of_birth: formatDate(subYears(new Date(), 15), 'yyyy-MM-dd'),
  phone_number: '0441234567',
});

export { signup };
