/* eslint-disable no-console */
import { renderHook, waitFor } from '@testing-library/react';
import { rest } from 'msw';

import { fakeWebStoreOrder } from '../../../utils/mockWebStoreDataUtils';
import { getQueryWrapper, setQueryMocks } from '../../../utils/testUtils';
import { TEST_USER_ID } from '../../user/constants';
import { TEST_ORDER_ID } from '../constants';
import { useWebStoreOrderQuery } from '../query';

test('should return web store order', async () => {
  const order = fakeWebStoreOrder();
  setQueryMocks(
    rest.get(`*/order/${TEST_ORDER_ID}/`, (req, res, ctx) =>
      res(ctx.status(200), ctx.json(order))
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

  await waitFor(() => expect(result.current.data).toEqual(order));
});

test('should return error for the failing order query', async () => {
  console.error = jest.fn();
  const error = { errorMessage: 'Failed to fetch web store order' };
  setQueryMocks(
    rest.get(`*/order/${TEST_ORDER_ID}/`, (req, res, ctx) =>
      res(ctx.status(404), ctx.json(error))
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
