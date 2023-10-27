import range from 'lodash/range';

import { fakeSignups } from '../../../utils/mockDataUtils';
import { Meta } from '../../api/types';

const TEST_PAGE_SIZE = 2;

const signupNames = range(1, TEST_PAGE_SIZE + 1).map((n) => ({
  first_name: 'First name',
  last_name: `Last name ${n}`,
}));
const signups = fakeSignups(
  TEST_PAGE_SIZE,
  signupNames.map((name) => ({ ...name }))
);
const count = 30;
const meta: Meta = { ...signups.meta, count };
signups.meta = meta;

const signupNamesPage2 = range(1, TEST_PAGE_SIZE + 1).map((n) => ({
  first_name: 'Page 2 user',
  last_name: `Last name ${n}`,
}));

const signupsPage2 = fakeSignups(
  TEST_PAGE_SIZE,
  signupNamesPage2.map((name) => ({ ...name }))
);

export { signupNames, signupNamesPage2, signups, signupsPage2 };
