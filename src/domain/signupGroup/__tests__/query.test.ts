/* eslint-disable no-console */
import { dehydrate, QueryClient } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';

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
const mockedSignupGroupResponse = http.get(
  `*/signup_group/${TEST_SIGNUP_GROUP_ID}`,
  () => HttpResponse.json(signupGroup)
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
      expect.objectContaining({
        queryKey: ['signupGroup', TEST_SIGNUP_GROUP_ID],
        queryHash: `["signupGroup","${TEST_SIGNUP_GROUP_ID}"]`,
        state: expect.objectContaining({ data: signupGroup }),
      }),
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
  console.error = vi.fn();
  const error = { errorMessage: 'Failed to fetch signup group' };
  setQueryMocks(
    http.get(`*/signup_group/${TEST_SIGNUP_GROUP_ID}`, () =>
      HttpResponse.json(error, { status: 404 })
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
