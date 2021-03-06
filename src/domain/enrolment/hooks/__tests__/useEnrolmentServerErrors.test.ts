/* eslint-disable @typescript-eslint/no-explicit-any */
import { act, renderHook } from '@testing-library/react';

import useEnrolmentServerErrors from '../useEnrolmentServerErrors';

const getHookWrapper = () => {
  const { result } = renderHook(() => useEnrolmentServerErrors());
  // Test the initial state of the request
  expect(result.current.serverErrorItems).toEqual([]);
  return { result };
};

it('should set server error items', async () => {
  const { result } = getHookWrapper();

  const error = {
    name: ['The name must be specified.'],
  };

  act(() => result.current.showServerErrors({ error }));

  expect(result.current.serverErrorItems).toEqual([
    { label: 'Nimi', message: 'Nimi on pakollinen.' },
  ]);
});

it('should return server error items when result is array', () => {
  const { result } = getHookWrapper();
  const callbackFn = jest.fn();
  const error = [
    { name: ['The name must be specified.'] },
    { name: ['The name must be specified.'] },
  ];

  act(() => result.current.showServerErrors({ callbackFn, error }));

  expect(result.current.serverErrorItems).toEqual([
    { label: 'Nimi', message: 'Nimi on pakollinen.' },
    { label: 'Nimi', message: 'Nimi on pakollinen.' },
  ]);
  expect(callbackFn).toBeCalled();
});

it('should return server error items when result is array of string', () => {
  const { result } = getHookWrapper();
  const callbackFn = jest.fn();
  const error = ['Could not find all objects to update.'];

  act(() => result.current.showServerErrors({ callbackFn, error }));

  expect(result.current.serverErrorItems).toEqual([
    { label: '', message: 'Kaikkia päivitettäviä objekteja ei löytynyt.' },
  ]);
  expect(callbackFn).toBeCalled();
});
