/* eslint-disable no-console */
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { fakeWebStorePayment } from '../../../utils/mockWebStoreDataUtils';
import { getQueryWrapper, setQueryMocks } from '../../../utils/testUtils';
import { TEST_USER_ID } from '../../user/constants';
import { TEST_PAYMENT_ID } from '../constants';
import { useWebStorePaymentQuery } from '../query';

test('should return web store payment', async () => {
  const payment = fakeWebStorePayment();
  setQueryMocks(
    http.get(`*/payment/${TEST_PAYMENT_ID}/`, () => HttpResponse.json(payment))
  );

  const wrapper = getQueryWrapper();
  const { result } = renderHook(
    () =>
      useWebStorePaymentQuery({
        args: { id: TEST_PAYMENT_ID, user: TEST_USER_ID },
      }),
    { wrapper }
  );

  await waitFor(() => expect(result.current.data).toEqual(payment));
});

test('should return error for the failing payment query', async () => {
  console.error = vi.fn();
  const error = { errorMessage: 'Failed to fetch web store payment' };
  setQueryMocks(
    http.get(`*/payment/${TEST_PAYMENT_ID}/`, () =>
      HttpResponse.json(error, { status: 404 })
    )
  );

  const wrapper = getQueryWrapper();
  const { result } = renderHook(
    () =>
      useWebStorePaymentQuery({
        args: { id: TEST_PAYMENT_ID, user: TEST_USER_ID },
      }),
    { wrapper }
  );

  await waitFor(() =>
    expect(result.current.error).toEqual(new Error(JSON.stringify(error)))
  );
});
