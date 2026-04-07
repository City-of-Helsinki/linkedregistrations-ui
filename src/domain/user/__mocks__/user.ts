import { http, HttpResponse } from 'msw';

import { fakeUser } from '../../../utils/mockDataUtils';
import { TEST_USER_EMAIL, TEST_USER_ID } from '../constants';

const user = fakeUser({
  email: TEST_USER_EMAIL,
  is_strongly_identified: true,
});

const mockedUserResponse = http.get(`*/user/${TEST_USER_ID}/`, () =>
  HttpResponse.json(user)
);
export { mockedUserResponse, user };
