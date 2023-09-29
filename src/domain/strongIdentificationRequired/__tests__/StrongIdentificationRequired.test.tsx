import * as nextAuth from 'next-auth/react';
import React from 'react';

import { ExtendedSession } from '../../../types';
import { configure, render, screen, userEvent } from '../../../utils/testUtils';
import StrongIdentificationRequired from '../StrongIdentificationRequired';

configure({ defaultHidden: true });

const renderComponent = (session?: ExtendedSession) =>
  render(<StrongIdentificationRequired />, { session });

const getSignOutButton = () => {
  return screen.getByRole('button', { name: /kirjaudu ulos/i });
};

test('should render strong identification required page', () => {
  renderComponent();

  expect(
    screen.getByRole('heading', { name: 'Vahva tunnistautuminen vaaditaan' })
  ).toBeInTheDocument();

  expect(
    screen.getByText(
      'Tämän sisällön näkeminen edellyttää vahvaa tunnistautumista. Kirjaudu ulos ja kokeile toista kirjautumistapaa.'
    )
  ).toBeInTheDocument();
});

test('should start signIn process', async () => {
  const user = userEvent.setup();
  jest.spyOn(nextAuth, 'signOut').mockImplementation();
  renderComponent();

  const signoutButton = getSignOutButton();
  await user.click(signoutButton);

  expect(nextAuth.signOut).toBeCalled();
});
