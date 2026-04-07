/* eslint-disable no-console */
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { fakeWebStoreOrder } from '../../../utils/mockWebStoreDataUtils';
import { getQueryWrapper, setQueryMocks } from '../../../utils/testUtils';
import { TEST_USER_ID } from '../../user/constants';
import { TEST_ORDER_ID } from '../constants';
import { useWebStoreOrderQuery } from '../query';

test('should return web store order', async () => {
  const order = fakeWebStoreOrder();
  setQueryMocks(
    http.get(`*/order/${TEST_ORDER_ID}/`, () => HttpResponse.json(order))
  );

  const wrapper = getQueryWrapper();
  const { result } = renderHook(
    () =>
      useWebStoreOrderQuery({
        args: { id: TEST_ORDER_ID, user: TEST_USER_ID },
      }),
    { wrapper }
  );

  await waitFor(() => expect(result.current.data).toEqual(order));
});

test('should return error for the failing order query', async () => {
  console.error = vi.fn();
  const error = { errorMessage: 'Failed to fetch web store order' };
  setQueryMocks(
    http.get(`*/order/${TEST_ORDER_ID}/`, () =>
      HttpResponse.json(error, { status: 404 })
    )
  );

  const wrapper = getQueryWrapper();
  const { result } = renderHook(
    () =>
      useWebStoreOrderQuery({
        args: { id: TEST_ORDER_ID, user: TEST_USER_ID },
      }),
    { wrapper }
  );

  await waitFor(() =>
    expect(result.current.error).toEqual(new Error(JSON.stringify(error)))
  );
});
