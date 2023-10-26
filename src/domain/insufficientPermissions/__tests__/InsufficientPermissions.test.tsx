import * as nextAuth from 'next-auth/react';
import React from 'react';

import { ExtendedSession } from '../../../types';
import { configure, render, screen, userEvent } from '../../../utils/testUtils';
import StrongIdentificationRequired from '../InsufficientPermissions';

configure({ defaultHidden: true });

const renderComponent = (session?: ExtendedSession) =>
  render(<StrongIdentificationRequired />, { session });

const getSignOutButton = () => {
  return screen.getByRole('button', { name: /kirjaudu ulos/i });
};

test('should render insufficient permissions page', () => {
  renderComponent();

  expect(
    screen.getByRole('heading', { name: 'Riittämättömät käyttöoikeudet' })
  ).toBeInTheDocument();

  expect(
    screen.getByText(
      'Sinulla ei ole oikeuksia tämän sisällön näkemiseen. Kirjaudu ulos ja kokeile toisella käyttäjätunnuksella.'
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
