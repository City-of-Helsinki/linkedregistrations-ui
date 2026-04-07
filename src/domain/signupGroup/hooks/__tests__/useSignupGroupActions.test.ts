/* eslint-disable @typescript-eslint/no-require-imports */
import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { getQueryWrapper, setQueryMocks } from '../../../../utils/testUtils';
import { registration } from '../../../registration/__mocks__/registration';
import { signupGroup } from '../../__mocks__/signupGroup';
import {
  SIGNUP_GROUP_INITIAL_VALUES,
  TEST_SIGNUP_GROUP_ID,
} from '../../constants';
import useSignupGroupAction from '../useSignupGroupActions';

vi.mock('next/dist/client/router', () => require('next-router-mock'));

describe('useSignupGroupActions', () => {
  it('should call onSuccess when updated successfully', async () => {
    const onSuccess = vi.fn();
    const wrapper = getQueryWrapper();
    setQueryMocks(
      http.put(`*/signup_group/${TEST_SIGNUP_GROUP_ID}/`, () =>
        HttpResponse.json(signupGroup)
      )
    );
    const { result } = renderHook(
      () => useSignupGroupAction({ registration, signupGroup }),
      { wrapper }
    );
    await act(() =>
      result.current.updateSignupGroup(SIGNUP_GROUP_INITIAL_VALUES, {
        onSuccess,
      })
    );

    await waitFor(() => expect(onSuccess).toBeCalled());
  });

  it('should call onError when update fails', async () => {
    // eslint-disable-next-line no-console
    console.error = vi.fn();
    const onError = vi.fn();
    const error = { errorMessage: 'Failed to update signup' };
    const wrapper = getQueryWrapper();
    setQueryMocks(
      http.put(`*/signup_group/${TEST_SIGNUP_GROUP_ID}/`, () =>
        HttpResponse.json(error, { status: 404 })
      )
    );
    const { result } = renderHook(
      () => useSignupGroupAction({ registration, signupGroup }),
      { wrapper }
    );
    await result.current.updateSignupGroup(SIGNUP_GROUP_INITIAL_VALUES, {
      onError,
    });

    await waitFor(() => expect(onError).toBeCalled());
  });
});
