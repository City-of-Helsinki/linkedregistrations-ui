/* eslint-disable no-console */
import { dehydrate, QueryClient } from '@tanstack/react-query';
import { rest } from 'msw';

import { fakeSignupGroup } from '../../../utils/mockDataUtils';
import {
  getQueryWrapper,
  renderHook,
  setQueryMocks,
  waitFor,
} from '../../../utils/testUtils';
import { TEST_SIGNUP_GROUP_ID } from '../constants';
import {
  fetchSignupGroupQuery,
  prefetchSignupGroupQuery,
  useSignupGroupQuery,
} from '../query';

const signupGroup = fakeSignupGroup();
const mockedSignupGroupResponse = rest.get(
  `*/signup_group/${TEST_SIGNUP_GROUP_ID}`,
  (req, res, ctx) => res(ctx.status(200), ctx.json(signupGroup))
);

it('should fetch signup group data', async () => {
  setQueryMocks(mockedSignupGroupResponse);

  const queryClient = new QueryClient();
  const result = await fetchSignupGroupQuery({
    args: { id: TEST_SIGNUP_GROUP_ID },
    queryClient,
    session: null,
  });

  expect(result).toEqual(signupGroup);
});

it('should prefetch signup group data', async () => {
  setQueryMocks(mockedSignupGroupResponse);

  const queryClient = new QueryClient();
  await prefetchSignupGroupQuery({
    args: { id: TEST_SIGNUP_GROUP_ID },
    queryClient,
    session: null,
  });

  expect(dehydrate(queryClient).queries).toEqual(
    expect.arrayContaining([
      {
        queryKey: ['signupGroup', TEST_SIGNUP_GROUP_ID],
        queryHash: `["signupGroup","${TEST_SIGNUP_GROUP_ID}"]`,
        state: expect.objectContaining({ data: signupGroup }),
      },
    ])
  );
});

test('should return signup group', async () => {
  setQueryMocks(mockedSignupGroupResponse);

  const wrapper = getQueryWrapper();
  const { result } = renderHook(
    () =>
      useSignupGroupQuery({
        args: { id: TEST_SIGNUP_GROUP_ID },
        session: null,
      }),
    { wrapper }
  );

  await waitFor(() => expect(result.current.data).toEqual(signupGroup));
});

test('should return error for the failing signup group query', async () => {
  console.error = jest.fn();
  const error = { errorMessage: 'Failed to fetch signup group' };
  setQueryMocks(
    rest.get(`*/signup_group/${TEST_SIGNUP_GROUP_ID}`, (req, res, ctx) =>
      res(ctx.status(404), ctx.json(error))
    )
  );

  const wrapper = getQueryWrapper();
  const { result } = renderHook(
    () =>
      useSignupGroupQuery({
        args: { id: TEST_SIGNUP_GROUP_ID },
        session: null,
      }),
    { wrapper }
  );

  await waitFor(() =>
    expect(result.current.error).toEqual(new Error(JSON.stringify(error)))
  );
});
