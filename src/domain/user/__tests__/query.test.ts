/* eslint-disable no-console */
import { QueryClient } from '@tanstack/react-query';
import { rest } from 'msw';

import { fakeUser } from '../../../utils/mockDataUtils';
import {
  getQueryWrapper,
  renderHook,
  setQueryMocks,
  waitFor,
} from '../../../utils/testUtils';
import { TEST_USER_ID } from '../constants';
import { fetchUserQuery, useUserQuery } from '../query';

const user = fakeUser();
const mockedUserResponse = rest.get(`*/user/${TEST_USER_ID}`, (req, res, ctx) =>
  res(ctx.status(200), ctx.json(user))
);

it('should fetch user data', async () => {
  setQueryMocks(mockedUserResponse);

  const queryClient = new QueryClient();
  const result = await fetchUserQuery({
    args: { username: TEST_USER_ID },
    queryClient,
    session: null,
  });

  expect(result).toEqual(user);
});

test('should return user', async () => {
  setQueryMocks(mockedUserResponse);

  const wrapper = getQueryWrapper();
  const { result } = renderHook(
    () => useUserQuery({ args: { username: TEST_USER_ID }, session: null }),
    { wrapper }
  );

  await waitFor(() => expect(result.current.data).toEqual(user));
});

test('should return error for the failing user query', async () => {
  console.error = jest.fn();
  const error = { errorMessage: 'Failed to fetch user' };
  setQueryMocks(
    rest.get(`*/user/${TEST_USER_ID}`, (req, res, ctx) =>
      res(ctx.status(404), ctx.json(error))
    )
  );

  const wrapper = getQueryWrapper();
  const { result } = renderHook(
    () => useUserQuery({ args: { username: TEST_USER_ID }, session: null }),
    { wrapper }
  );

  await waitFor(() =>
    expect(result.current.error).toEqual(new Error(JSON.stringify(error)))
  );
});
