import { renderHook, waitFor } from '@testing-library/react';

import {
  fakeLocalisedObject,
  fakePlace,
} from '../../../../utils/mockDataUtils';
import { getQueryWrapper, setQueryMocks } from '../../../../utils/testUtils';
import { event } from '../../../event/__mocks__/event';
import { mockedLanguagesResponses } from '../../../language/__mocks__/languages';
import useEventLocationText from '../useEventLocationText';

test('should return language options', async () => {
  const wrapper = getQueryWrapper();

  const { result } = renderHook(
    () =>
      useEventLocationText({
        ...event,
        location: fakePlace({
          address_locality: fakeLocalisedObject('City'),
          name: fakeLocalisedObject('Name'),
          street_address: fakeLocalisedObject('Street'),
        }),
      }),
    {
      wrapper,
    }
  );

  await waitFor(() => expect(result.current.length).toBeTruthy());

  expect(result.current).toEqual('Name, Street, City');
});

test('should return default value if place is missing', async () => {
  setQueryMocks(...mockedLanguagesResponses);
  const wrapper = getQueryWrapper();

  const { result } = renderHook(
    () => useEventLocationText({ ...event, location: null }),
    { wrapper }
  );

  expect(result.current).toEqual('-');
});
