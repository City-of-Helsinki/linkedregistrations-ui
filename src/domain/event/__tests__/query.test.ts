/* eslint-disable no-console */
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { getQueryWrapper, setQueryMocks } from '../../../utils/testUtils';
import { event } from '../__mocks__/event';
import { TEST_EVENT_ID } from '../constants';
import { useEventQuery } from '../query';

test('should return event', async () => {
  setQueryMocks(
    http.get(`*/event/${TEST_EVENT_ID}/`, () => HttpResponse.json(event))
  );

  const wrapper = getQueryWrapper();
  const { result } = renderHook(
    () => useEventQuery({ args: { id: TEST_EVENT_ID }, session: null }),
    { wrapper }
  );

  await waitFor(() => expect(result.current.data).toEqual(event));
});

test('should return error for the failing event query', async () => {
  console.error = vi.fn();
  const error = { errorMessage: 'Failed to fetch event' };
  setQueryMocks(
    http.get(`*/event/${TEST_EVENT_ID}/`, () =>
      HttpResponse.json(error, { status: 404 })
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
