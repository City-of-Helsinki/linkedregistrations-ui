/* eslint-disable no-console */
import { dehydrate, QueryClient } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';

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
const mockedSignupResponse = http.get(`*/signup/${TEST_SIGNUP_ID}`, () =>
  HttpResponse.json(signup)
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
      expect.objectContaining({
        queryKey: ['signup', TEST_SIGNUP_ID],
        queryHash: `["signup","${TEST_SIGNUP_ID}"]`,
        state: expect.objectContaining({ data: signup }),
      }),
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
    console.error = vi.fn();
    const error = { errorMessage: 'Failed to fetch signup' };
    setQueryMocks(
      http.get(`*/signup/${TEST_SIGNUP_ID}`, () =>
        HttpResponse.json(error, { status: errorCode })
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
