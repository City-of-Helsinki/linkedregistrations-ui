/* eslint-disable no-console */
import { dehydrate, QueryClient } from '@tanstack/react-query';
import { rest } from 'msw';

import { fakeSignup } from '../../../utils/mockDataUtils';
import {
  getQueryWrapper,
  renderHook,
  setQueryMocks,
  waitFor,
} from '../../../utils/testUtils';
import { TEST_SIGNUP_ID } from '../constants';
import {
  fetchSignupQuery,
  prefetchSignupQuery,
  useSignupQuery,
} from '../query';

const signup = fakeSignup();
const mockedSignupResponse = rest.get(
  `*/signup/${TEST_SIGNUP_ID}`,
  (req, res, ctx) => res(ctx.status(200), ctx.json(signup))
);

it('should fetch signup data', async () => {
  setQueryMocks(mockedSignupResponse);

  const queryClient = new QueryClient();
  const result = await fetchSignupQuery({
    args: { id: TEST_SIGNUP_ID },
    queryClient,
    session: null,
  });

  expect(result).toEqual(signup);
});

it('should prefetch signup data', async () => {
  setQueryMocks(mockedSignupResponse);

  const queryClient = new QueryClient();
  await prefetchSignupQuery({
    args: { id: TEST_SIGNUP_ID },
    queryClient,
    session: null,
  });

  expect(dehydrate(queryClient).queries).toEqual(
    expect.arrayContaining([
      {
        queryKey: ['signup', TEST_SIGNUP_ID],
        queryHash: `["signup","${TEST_SIGNUP_ID}"]`,
        state: expect.objectContaining({ data: signup }),
      },
    ])
  );
});

test('should return signup', async () => {
  setQueryMocks(mockedSignupResponse);

  const wrapper = getQueryWrapper();
  const { result } = renderHook(
    () => useSignupQuery({ args: { id: TEST_SIGNUP_ID }, session: null }),
    { wrapper }
  );

  await waitFor(() => expect(result.current.data).toEqual(signup));
});

test.each([401, 403, 404, 500, 502])(
  'should return error for the failing signup query, error code %s',
  async (errorCode) => {
    console.error = jest.fn();
    const error = { errorMessage: 'Failed to fetch signup' };
    setQueryMocks(
      rest.get(`*/signup/${TEST_SIGNUP_ID}`, (req, res, ctx) =>
        res(ctx.status(errorCode), ctx.json(error))
      )
    );

    const wrapper = getQueryWrapper();
    const { result } = renderHook(
      () => useSignupQuery({ args: { id: TEST_SIGNUP_ID }, session: null }),
      { wrapper }
    );

    await waitFor(() =>
      expect(result.current.error).toEqual(new Error(JSON.stringify(error)))
    );
  }
);
