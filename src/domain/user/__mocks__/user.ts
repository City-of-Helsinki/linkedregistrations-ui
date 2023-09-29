import { rest } from 'msw';

import { fakeUser } from '../../../utils/mockDataUtils';
import { TEST_USER_EMAIL, TEST_USER_ID } from '../constants';

const user = fakeUser({
  email: TEST_USER_EMAIL,
});

const mockedUserResponse = rest.get(
  `*/user/${TEST_USER_ID}/`,
  (req, res, ctx) => res(ctx.status(200), ctx.json(user))
);
export { mockedUserResponse, user };
