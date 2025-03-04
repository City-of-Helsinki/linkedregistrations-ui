import * as nextAuth from 'next-auth/react';
import React from 'react';

import { LoginMethod } from "../../../constants";
import { ExtendedSession } from '../../../types';
import { configure, render, screen, userEvent } from '../../../utils/testUtils';
import SignInRequired from '../SignInRequired';

configure({ defaultHidden: true });

const renderComponent = (session?: ExtendedSession, loginMethods?: LoginMethod[]) =>
  render(<SignInRequired loginMethods={loginMethods}/>, { session });

const getSignInButton = () => {
  return screen.getByRole('button', { name: /kirjaudu/i });
};

test('should render sign in required page', () => {
  renderComponent();

  expect(
    screen.getByRole('heading', { name: 'Kirjautuminen vaaditaan' })
  ).toBeInTheDocument();

  expect(
    screen.getByText(
      'Sinun tulee olla kirjautunut tarkastellaksesi ilmoittautumisen tietoja.'
    )
  ).toBeInTheDocument();
});

test('should start signIn process', async () => {
  const user = userEvent.setup();
  jest.spyOn(nextAuth, 'signIn').mockImplementation();
  renderComponent();

  const signInButton = getSignInButton();
  await user.click(signInButton);

  expect(nextAuth.signIn).toBeCalledWith('tunnistamo', undefined, {
    ui_locales: 'fi',
  });
});

test('should start signIn process with loginMethods', async () => {
  const user = userEvent.setup();
  jest.spyOn(nextAuth, 'signIn').mockImplementation();
  renderComponent(undefined, ['suomi_fi']);

  const signInButton = getSignInButton();
  await user.click(signInButton);

  expect(nextAuth.signIn).toBeCalledWith('tunnistamo', undefined, {
    login_methods: 'suomi_fi',
    ui_locales: 'fi',
  });
});
