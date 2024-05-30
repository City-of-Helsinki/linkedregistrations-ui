/* eslint-disable no-console */
import { renderHook, waitFor } from '@testing-library/react';
import { rest } from 'msw';

import { getQueryWrapper, setQueryMocks } from '../../../utils/testUtils';
import { event } from '../__mocks__/event';
import { TEST_EVENT_ID } from '../constants';
import { useEventQuery } from '../query';

test('should return event', async () => {
  setQueryMocks(
    rest.get(`*/event/${TEST_EVENT_ID}/`, (req, res, ctx) =>
      res(ctx.status(200), ctx.json(event))
    )
  );

  const wrapper = getQueryWrapper();
  const { result } = renderHook(
    () => useEventQuery({ args: { id: TEST_EVENT_ID }, session: null }),
    { wrapper }
  );

  await waitFor(() => expect(result.current.data).toEqual(event));
});

test('should return error for the failing event query', async () => {
  console.error = jest.fn();
  const error = { errorMessage: 'Failed to fetch event' };
  setQueryMocks(
    rest.get(`*/event/${TEST_EVENT_ID}/`, (req, res, ctx) =>
      res(ctx.status(404), ctx.json(error))
    )
  );

  const wrapper = getQueryWrapper();
  const { result } = renderHook(
    () => useEventQuery({ args: { id: TEST_EVENT_ID }, session: null }),
    { wrapper }
  );

  await waitFor(() =>
    expect(result.current.error).toEqual(new Error(JSON.stringify(error)))
  );
});
