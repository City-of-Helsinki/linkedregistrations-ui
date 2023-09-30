import { act, renderHook, waitFor } from '@testing-library/react';
import { rest } from 'msw';

import { getQueryWrapper, setQueryMocks } from '../../../../utils/testUtils';
import { registration } from '../../../registration/__mocks__/registration';
import { SIGNUP_GROUP_INITIAL_VALUES } from '../../../signupGroup/constants';
import { signup } from '../../__mocks__/signup';
import { TEST_SIGNUP_ID } from '../../constants';
import useSignupAction from '../useSignupActions';

describe('useSignupActions', () => {
  it('should call onSuccess when updated successfully', async () => {
    const onSuccess = jest.fn();
    const wrapper = getQueryWrapper();
    setQueryMocks(
      rest.put(`*/signup/${TEST_SIGNUP_ID}/`, (req, res, ctx) =>
        res(ctx.status(200), ctx.json(signup))
      )
    );
    const { result } = renderHook(
      () => useSignupAction({ registration, signup }),
      { wrapper }
    );
    await act(() =>
      result.current.updateSignup(SIGNUP_GROUP_INITIAL_VALUES, { onSuccess })
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
      rest.put(`*/signup/${TEST_SIGNUP_ID}/`, (req, res, ctx) =>
        res(ctx.status(404), ctx.json(error))
      )
    );
    const { result } = renderHook(
      () => useSignupAction({ registration, signup }),
      { wrapper }
    );
    await result.current.updateSignup(SIGNUP_GROUP_INITIAL_VALUES, { onError });

    await waitFor(() => expect(onError).toBeCalled());
  });
});
