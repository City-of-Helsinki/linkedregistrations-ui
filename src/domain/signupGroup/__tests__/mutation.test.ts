import { renderHook, waitFor } from '@testing-library/react';
import { rest } from 'msw';

import { fakeAuthenticatedSession } from '../../../utils/mockSession';
import { getQueryWrapper, setQueryMocks } from '../../../utils/testUtils';
import { TEST_REGISTRATION_ID } from '../../registration/constants';
import { signupGroup } from '../__mocks__/signupGroup';
import { TEST_SIGNUP_GROUP_ID } from '../constants';
import { useUpdateSignupGroupMutation } from '../mutation';

describe('useUpdateSignupGroupMutation', () => {
  it('should update signup successfully', async () => {
    const wrapper = getQueryWrapper();
    setQueryMocks(
      rest.put(`*/signup_group/${TEST_SIGNUP_GROUP_ID}/`, (req, res, ctx) =>
        res(ctx.status(200), ctx.json(signupGroup))
      )
    );
    const { result } = renderHook(
      () =>
        useUpdateSignupGroupMutation({ session: fakeAuthenticatedSession() }),
      { wrapper }
    );
    result.current.mutate({
      extra_info: '',
      id: TEST_SIGNUP_GROUP_ID,
      registration: TEST_REGISTRATION_ID,
      signups: [],
    });

    await waitFor(() => expect(result.current.data).toEqual(signupGroup));
  });

  it('should get error when mutation fails', async () => {
    // eslint-disable-next-line no-console
    console.error = jest.fn();
    const error = { errorMessage: 'Failed to update signup' };
    const wrapper = getQueryWrapper();
    setQueryMocks(
      rest.put(`*/signup_group/${TEST_SIGNUP_GROUP_ID}/`, (req, res, ctx) =>
        res(ctx.status(404), ctx.json(error))
      )
    );

    const { result } = renderHook(
      () =>
        useUpdateSignupGroupMutation({ session: fakeAuthenticatedSession() }),
      { wrapper }
    );
    result.current.mutate({
      extra_info: '',
      id: TEST_SIGNUP_GROUP_ID,
      registration: TEST_REGISTRATION_ID,
      signups: [],
    });

    await waitFor(() =>
      expect(result.current.error).toEqual(new Error(JSON.stringify(error)))
    );
  });
});
