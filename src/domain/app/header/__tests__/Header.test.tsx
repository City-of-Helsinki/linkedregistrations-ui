/* eslint-disable @typescript-eslint/no-require-imports */
import i18n from 'i18next';
import { rest } from 'msw';
import * as nextAuth from 'next-auth/react';
import mockRouter from 'next-router-mock';
import React from 'react';

import { ExtendedSession } from '../../../../types';
import { fakeUser } from '../../../../utils/mockDataUtils';
import {
  fakeAuthenticatedSession,
  fakeOidcUser,
} from '../../../../utils/mockSession';
import {
  configure,
  render,
  screen,
  setQueryMocks,
  userEvent,
  waitFor,
} from '../../../../utils/testUtils';
import { TEST_USER_ID } from '../../../user/constants';
import Header from '../Header';

configure({ defaultHidden: true });

jest.mock('next/dist/client/router', () => require('next-router-mock'));

beforeEach(() => {
  jest.restoreAllMocks();
  mockRouter.setCurrentUrl('');
  i18n.changeLanguage('fi');
});

const renderComponent = (session?: ExtendedSession) =>
  render(<Header />, { session });

const getElement = (
  key:
    | 'appName'
    | 'enOption'
    | 'signInButton'
    | 'signInMenuButton'
    | 'signOutButton'
    | 'svOption'
) => {
  switch (key) {
    case 'appName':
      return screen.getByRole('link', {
        name: /linked registrations/i,
      });
    case 'enOption':
      return screen.getByRole('button', {
        hidden: false,
        name: /In English/i,
      });
    case 'signInButton':
      return screen.getByRole('button', { name: 'Kirjaudu' });
    case 'signInMenuButton':
      return screen.getByRole('button', { name: /kirjaudu sisään/i });
    case 'signOutButton':
      return screen.getByRole('button', { name: /kirjaudu ulos/i });
    case 'svOption':
      return screen.getByRole('button', {
        hidden: false,
        name: /På svenska/i,
      });
  }
};

test('should route to home page by clicking application name', async () => {
  renderComponent();

  const appName = getElement('appName');

  expect(appName).toHaveAttribute('href', '/fi');
});

test('should change language', async () => {
  const user = userEvent.setup();
  renderComponent();

  const enOption = getElement('enOption');
  await user.click(enOption);
  expect(mockRouter.locale).toBe('en');

  const svOption = getElement('svOption');
  await user.click(svOption);
  expect(mockRouter.locale).toBe('sv');
});

test('should start login process', async () => {
  const user = userEvent.setup();
  jest.spyOn(nextAuth, 'signIn').mockImplementation();
  renderComponent();

  const signInButton = getElement('signInButton');
  await user.click(signInButton);
  const signInMenuButton = getElement('signInMenuButton');
  await user.click(signInMenuButton);

  expect(nextAuth.signIn).toBeCalledWith('tunnistamo', undefined, {
    ui_locales: 'fi',
  });
});

test('should start logout process', async () => {
  const user = userEvent.setup();
  jest
    .spyOn(nextAuth, 'signOut')
    .mockImplementation()
    .mockResolvedValue({ url: 'https://test.com' });

  const userFirstName = 'User';
  const userData = fakeUser({ first_name: userFirstName });

  const mocks = [
    rest.get(`*/user/${TEST_USER_ID}/`, (req, res, ctx) =>
      res(ctx.status(200), ctx.json(userData))
    ),
  ];
  setQueryMocks(...mocks);

  const session = fakeAuthenticatedSession({
    user: fakeOidcUser({ given_name: userFirstName }),
  });
  renderComponent(session);

  const userMenuButton = await screen.findByRole(
    'button',
    { name: userFirstName },
    { timeout: 10000 }
  );
  await user.click(userMenuButton);

  const signOutButton = getElement('signOutButton');
  await user.click(signOutButton);

  await waitFor(() => expect(nextAuth.signOut).toBeCalled());
});
