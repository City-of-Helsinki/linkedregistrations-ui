import { renderHook, waitFor } from '@testing-library/react';
import { rest } from 'msw';

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
      rest.patch(`*/signup/${TEST_SIGNUP_ID}/`, (req, res, ctx) =>
        res(ctx.status(200), ctx.json(signup))
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

    await waitFor(() => expect(result.current.data).toEqual(signup));
  });

  it('should get error when mutation fails', async () => {
    // eslint-disable-next-line no-console
    console.error = jest.fn();
    const error = { errorMessage: 'Failed to patch signup presence status' };
    const wrapper = getQueryWrapper();
    setQueryMocks(
      rest.patch(`*/signup/${TEST_SIGNUP_ID}/`, (req, res, ctx) =>
        res(ctx.status(404), ctx.json(error))
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
      rest.put(`*/signup/${TEST_SIGNUP_ID}/`, (req, res, ctx) =>
        res(ctx.status(200), ctx.json(signup))
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

    await waitFor(() => expect(result.current.data).toEqual(signup));
  });

  it('should get error when mutation fails', async () => {
    // eslint-disable-next-line no-console
    console.error = jest.fn();
    const error = { errorMessage: 'Failed to update signup' };
    const wrapper = getQueryWrapper();
    setQueryMocks(
      rest.put(`*/signup/${TEST_SIGNUP_ID}/`, (req, res, ctx) =>
        res(ctx.status(404), ctx.json(error))
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
