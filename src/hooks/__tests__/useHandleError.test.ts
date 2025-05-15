import * as Sentry from '@sentry/browser';
import { act, renderHook } from '@testing-library/react';
import { advanceTo, clear } from 'jest-date-mock';

import { mockedUserResponse, user } from '../../domain/user/__mocks__/user';
import useUser from '../../domain/user/hooks/useUser';
import { fakeAuthenticatedSession } from '../../utils/mockSession';
import { getQueryWrapper, setQueryMocks, waitFor } from '../../utils/testUtils';
import useHandleError from '../useHandleError';

afterEach(() => {
  clear();
});

describe('useHandleError', () => {
  it('should call savingFinished when handling error finished', async () => {
    advanceTo('2023-01-01');
    const savingFinished = jest.fn();
    setQueryMocks(mockedUserResponse);
    const wrapper = getQueryWrapper(fakeAuthenticatedSession());
    const { result: userResult } = renderHook(() => useUser(), {
      wrapper,
    });
    const { result } = renderHook(() => useHandleError(), {
      wrapper,
    });
    await waitFor(() => expect(userResult.current.user).toEqual(user));
    await act(
      async () =>
        await result.current.handleError({
          error: new Error(),
          message: 'Failed to save',
          savingFinished,
        })
    );
    await waitFor(() =>
      expect(Sentry.captureException).toBeCalledWith('Failed to save', {
        extra: {
          data: expect.objectContaining({
            currentUrl: 'http://localhost/',
            errorAsString: '{}',
            object: undefined,
            payloadAsString: undefined,
            timestamp: new Date('2023-01-01T00:00:00.000Z'),
            user: user.username,
          }),
          level: 'error',
        },
      })
    );
  });
});
