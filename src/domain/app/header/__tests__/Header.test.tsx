/* eslint-disable import/no-named-as-default-member */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
import i18n from 'i18next';
import { rest } from 'msw';
import * as nextAuth from 'next-auth/react';
import mockRouter from 'next-router-mock';
import singletonRouter from 'next/router';
import React from 'react';

import { ExtendedSession } from '../../../../types';
import { fakeUser } from '../../../../utils/mockDataUtils';
import { fakeAuthenticatedSession } from '../../../../utils/mockSession';
import {
  configure,
  render,
  screen,
  setQueryMocks,
  userEvent,
  waitFor,
} from '../../../../utils/testUtils';
import { TEST_REGISTRATION_ID } from '../../../registration/constants';
import { TEST_USER_ID } from '../../../user/constants';
import { ROUTES } from '../../routes/constants';
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

const getElement = (key: 'enOption' | 'menuButton' | 'svOption') => {
  switch (key) {
    case 'enOption':
      return screen.getByRole('link', {
        hidden: false,
        name: /In English/i,
      });
    case 'svOption':
      return screen.getByRole('link', {
        hidden: false,
        name: /På svenska/i,
      });
    case 'menuButton':
      return screen.getByRole('button', {
        name: 'Valikko',
      });
  }
};

const getElements = (
  key:
    | 'appName'
    | 'backToSignupGroupFormLink'
    | 'languageSelector'
    | 'signInButton'
    | 'signOutLink'
) => {
  switch (key) {
    case 'appName':
      return screen.getAllByRole('link', {
        name: /linked registrations/i,
      });
    case 'backToSignupGroupFormLink':
      return screen.getAllByRole('link', {
        name: /palaa ilmoittautumiskaavakkeeseen/i,
      });
    case 'languageSelector':
      return screen.getAllByRole('button', {
        name: /suomi - kielivalikko/i,
      });
    case 'signInButton':
      return screen.getAllByRole('button', { name: /kirjaudu sisään/i });
    case 'signOutLink':
      return screen.getAllByRole('link', { name: /kirjaudu ulos/i });
  }
};

test('should route to home page by clicking application name', async () => {
  const user = userEvent.setup();

  singletonRouter.push({ pathname: '/registrations' });
  renderComponent();
  expect(mockRouter.asPath).toBe('/registrations');

  const appName = getElements('appName')[0];
  await user.click(appName);

  expect(mockRouter.asPath).toBe('/');
});

test('should show mobile menu', async () => {
  const user = userEvent.setup();
  global.innerWidth = 500;
  renderComponent();

  expect(document.querySelector('#hds-mobile-menu')).not.toBeInTheDocument();
  const menuButton = getElement('menuButton');
  await user.click(menuButton);

  await waitFor(() =>
    expect(document.querySelector('#hds-mobile-menu')).toBeInTheDocument()
  );
});

test('should change language', async () => {
  const user = userEvent.setup();
  renderComponent();

  const languageSelector = getElements('languageSelector')[0];
  await user.click(languageSelector);

  const enOption = getElement('enOption');
  await user.click(enOption);
  expect(mockRouter.locale).toBe('en');

  await user.click(languageSelector);

  const svOption = getElement('svOption');
  await user.click(svOption);
  expect(mockRouter.locale).toBe('sv');
});

test('should start login process', async () => {
  const user = userEvent.setup();
  jest.spyOn(nextAuth, 'signIn').mockImplementation();
  renderComponent();

  const signInButtons = getElements('signInButton');
  await user.click(signInButtons[0]);

  expect(nextAuth.signIn).toBeCalledWith('tunnistamo');
});

test('should start logout process', async () => {
  const user = userEvent.setup();
  jest.spyOn(nextAuth, 'signOut').mockImplementation();

  const username = 'Username';
  const userData = fakeUser({ display_name: username });

  const mocks = [
    rest.get(`*/user/${TEST_USER_ID}/`, (req, res, ctx) =>
      res(ctx.status(200), ctx.json(userData))
    ),
  ];
  setQueryMocks(...mocks);

  const session = fakeAuthenticatedSession();
  renderComponent(session);

  const userMenuButton = await screen.findByRole(
    'button',
    { name: username },
    { timeout: 10000 }
  );
  await user.click(userMenuButton);

  const signOutLinks = getElements('signOutLink');
  await user.click(signOutLinks[0]);

  await waitFor(() => expect(nextAuth.signOut).toBeCalled());
});

test('should show back to signup group form link', async () => {
  const user = userEvent.setup();

  singletonRouter.push({
    pathname: ROUTES.CREATE_SIGNUP_GROUP_SUMMARY,
    query: { registrationId: TEST_REGISTRATION_ID },
  });
  renderComponent();

  const backToSignupGroupFormLinks = getElements('backToSignupGroupFormLink');
  await user.click(backToSignupGroupFormLinks[0]);

  expect(mockRouter.asPath).toBe('/registration/1/signup-group/create');
});
