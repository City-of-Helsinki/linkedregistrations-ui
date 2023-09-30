import { act, renderHook, waitFor } from '@testing-library/react';
import { rest } from 'msw';

import { getQueryWrapper, setQueryMocks } from '../../../../utils/testUtils';
import { registration } from '../../../registration/__mocks__/registration';
import { signupGroup } from '../../__mocks__/signupGroup';
import {
  SIGNUP_GROUP_INITIAL_VALUES,
  TEST_SIGNUP_GROUP_ID,
} from '../../constants';
import useSignupGroupAction from '../useSignupGroupActions';

describe('useSignupGroupActions', () => {
  it('should call onSuccess when updated successfully', async () => {
    const onSuccess = jest.fn();
    const wrapper = getQueryWrapper();
    setQueryMocks(
      rest.put(`*/signup_group/${TEST_SIGNUP_GROUP_ID}/`, (req, res, ctx) =>
        res(ctx.status(200), ctx.json(signupGroup))
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
    console.error = jest.fn();
    const onError = jest.fn();
    const error = { errorMessage: 'Failed to update signup' };
    const wrapper = getQueryWrapper();
    setQueryMocks(
      rest.put(`*/signup_group/${TEST_SIGNUP_GROUP_ID}/`, (req, res, ctx) =>
        res(ctx.status(404), ctx.json(error))
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
