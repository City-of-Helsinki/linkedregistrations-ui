/* eslint-disable no-console */
import { dehydrate, QueryClient } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';

import { fakeRegistration } from '../../../utils/mockDataUtils';
import {
  getQueryWrapper,
  renderHook,
  setQueryMocks,
  waitFor,
} from '../../../utils/testUtils';
import { TEST_REGISTRATION_ID } from '../constants';
import {
  fetchRegistrationQuery,
  prefetchRegistrationQuery,
  useRegistrationQuery,
} from '../query';

const registration = fakeRegistration();
const mockedRegistrationResponse = http.get(
  `*/registration/${TEST_REGISTRATION_ID}`,
  () => HttpResponse.json(registration)
);

it('should fetch registration data', async () => {
  setQueryMocks(mockedRegistrationResponse);

  const queryClient = new QueryClient();
  const result = await fetchRegistrationQuery({
    args: { id: TEST_REGISTRATION_ID },
    queryClient,
    session: null,
  });

  expect(result).toEqual(registration);
});

it('should prefetch registration data', async () => {
  setQueryMocks(mockedRegistrationResponse);

  const queryClient = new QueryClient();
  await prefetchRegistrationQuery({
    args: { id: TEST_REGISTRATION_ID },
    queryClient,
    session: null,
  });

  expect(dehydrate(queryClient).queries).toEqual(
    expect.arrayContaining([
      {
        queryKey: ['registration', TEST_REGISTRATION_ID],
        queryHash: `["registration","${TEST_REGISTRATION_ID}"]`,
        state: expect.objectContaining({ data: registration }),
      },
    ])
  );
});

test('should return registration', async () => {
  setQueryMocks(mockedRegistrationResponse);

  const wrapper = getQueryWrapper();
  const { result } = renderHook(
    () =>
      useRegistrationQuery({
        args: { id: TEST_REGISTRATION_ID },
        session: null,
      }),
    { wrapper }
  );

  await waitFor(() => expect(result.current.data).toEqual(registration));
});

test('should return error for the failing registration query', async () => {
  console.error = vi.fn();
  const error = { errorMessage: 'Failed to fetch registration' };
  setQueryMocks(
    http.get(`*/registration/${TEST_REGISTRATION_ID}`, () =>
      HttpResponse.json(error, { status: 404 })
    )
  );

  const wrapper = getQueryWrapper();
  const { result } = renderHook(
    () =>
      useRegistrationQuery({
        args: { id: TEST_REGISTRATION_ID },
        session: null,
      }),
    { wrapper }
  );

  await waitFor(() =>
    expect(result.current.error).toEqual(new Error(JSON.stringify(error)))
  );
});
