import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { fakeAuthenticatedSession } from '../../../utils/mockSession';
import { getQueryWrapper, setQueryMocks } from '../../../utils/testUtils';
import { TEST_REGISTRATION_ID } from '../../registration/constants';
import { signup } from '../__mocks__/signup';
import { PRESENCE_STATUS, TEST_SIGNUP_ID } from '../constants';
import { usePatchSignupMutation, useUpdateSignupMutation } from '../mutation';

describe('usePatchSignup', () => {
  it('should patch signup successfully', async () => {
    const wrapper = getQueryWrapper();
    setQueryMocks(
      http.patch(`*/signup/${TEST_SIGNUP_ID}/`, () => HttpResponse.json(signup))
    );
    const { result } = renderHook(
      () => usePatchSignupMutation({ session: fakeAuthenticatedSession() }),
      { wrapper }
    );
    result.current.mutate({
      id: TEST_SIGNUP_ID,
      presence_status: PRESENCE_STATUS.Present,
    });

    await waitFor(() => expect(result.current.data).toEqual(signup));
  });

  it('should get error when mutation fails', async () => {
    // eslint-disable-next-line no-console
    console.error = vi.fn();
    const error = { errorMessage: 'Failed to patch signup presence status' };
    const wrapper = getQueryWrapper();
    setQueryMocks(
      http.patch(`*/signup/${TEST_SIGNUP_ID}/`, () =>
        HttpResponse.json(error, { status: 404 })
      )
    );
    const { result } = renderHook(
      () => usePatchSignupMutation({ session: fakeAuthenticatedSession() }),
      { wrapper }
    );
    result.current.mutate({
      id: TEST_SIGNUP_ID,
      presence_status: PRESENCE_STATUS.Present,
    });

    await waitFor(() =>
      expect(result.current.error).toEqual(new Error(JSON.stringify(error)))
    );
  });
});

describe('useUpdateSignupMutation', () => {
  it('should update signup successfully', async () => {
    const wrapper = getQueryWrapper();
    setQueryMocks(
      http.put(`*/signup/${TEST_SIGNUP_ID}/`, () => HttpResponse.json(signup))
    );
    const { result } = renderHook(
      () => useUpdateSignupMutation({ session: fakeAuthenticatedSession() }),
      { wrapper }
    );
    result.current.mutate({
      id: TEST_SIGNUP_ID,
      phone_number: '',
      registration: TEST_REGISTRATION_ID,
      user_consent: true,
    });

    await waitFor(() => expect(result.current.data).toEqual(signup));
  });

  it('should get error when mutation fails', async () => {
    // eslint-disable-next-line no-console
    console.error = vi.fn();
    const error = { errorMessage: 'Failed to update signup' };
    const wrapper = getQueryWrapper();
    setQueryMocks(
      http.put(`*/signup/${TEST_SIGNUP_ID}/`, () =>
        HttpResponse.json(error, { status: 404 })
      )
    );
    const { result } = renderHook(
      () => useUpdateSignupMutation({ session: fakeAuthenticatedSession() }),
      { wrapper }
    );
    result.current.mutate({
      id: TEST_SIGNUP_ID,
      phone_number: '',
      registration: TEST_REGISTRATION_ID,
      user_consent: true,
    });

    await waitFor(() =>
      expect(result.current.error).toEqual(new Error(JSON.stringify(error)))
    );
  });
});
