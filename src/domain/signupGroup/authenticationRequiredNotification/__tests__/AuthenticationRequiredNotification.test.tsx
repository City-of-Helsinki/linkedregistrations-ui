import * as nextAuth from 'next-auth/react';
import React from 'react';

import { ExtendedSession } from '../../../../types';
import {
  configure,
  render,
  screen,
  userEvent,
} from '../../../../utils/testUtils';
import AuthenticationRequiredNotification from '../AuthenticationRequiredNotification';

configure({ defaultHidden: true });

const renderComponent = (session?: ExtendedSession) =>
  render(<AuthenticationRequiredNotification />, { session });

const getSignInButton = () => {
  return screen.getByRole('button', { name: /kirjaudu sisään/i });
};

test('should render authentication required notification', () => {
  renderComponent();

  screen.getByRole('heading', { name: 'Kirjaudu sisään' });
  screen.getByText(
    'Sinun täytyy kirjautua sisään ilmoittautuaksesi tähän tapahtumaan.'
  );
});

test('should start signIn process', async () => {
  const user = userEvent.setup();
  vi.spyOn(nextAuth, 'signIn');
  renderComponent();

  const signInButton = getSignInButton();
  await user.click(signInButton);

  expect(nextAuth.signIn).toBeCalledWith('tunnistamo', undefined, {
    ui_locales: 'fi',
  });
});
