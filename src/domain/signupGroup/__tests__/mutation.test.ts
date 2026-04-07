import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

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
      http.put(`*/signup_group/${TEST_SIGNUP_GROUP_ID}/`, () =>
        HttpResponse.json(signupGroup)
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
    console.error = vi.fn();
    const error = { errorMessage: 'Failed to update signup' };
    const wrapper = getQueryWrapper();
    setQueryMocks(
      http.put(`*/signup_group/${TEST_SIGNUP_GROUP_ID}/`, () =>
        HttpResponse.json(error, { status: 404 })
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
