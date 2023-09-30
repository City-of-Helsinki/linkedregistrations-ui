/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { axe } from 'jest-axe';
import { rest } from 'msw';
import singletonRouter from 'next/router';
import * as nextAuth from 'next-auth/react';
import mockRouter from 'next-router-mock';
import React from 'react';
import { toast } from 'react-toastify';

import { ExtendedSession } from '../../../types';
import { fakeAuthenticatedSession } from '../../../utils/mockSession';
import {
  actWait,
  configure,
  loadingSpinnerIsNotInDocument,
  render,
  screen,
  setQueryMocks,
  waitFor,
} from '../../../utils/testUtils';
import { ROUTES } from '../../app/routes/constants';
import { mockedLanguagesResponses } from '../../language/__mocks__/languages';
import { registration } from '../../registration/__mocks__/registration';
import { TEST_REGISTRATION_ID } from '../../registration/constants';
import {
  findFirstNameInput,
  shouldRenderSignupFormFields,
  tryToCancel,
  tryToUpdate,
} from '../../signupGroup/testUtils';
import { signup } from '../__mocks__/signup';
import { TEST_SIGNUP_ID } from '../constants';
import EditSignupPage from '../EditSignupPage';

configure({ defaultHidden: true });

jest.mock('next/dist/client/router', () => require('next-router-mock'));

const defaultSession = fakeAuthenticatedSession();
const renderComponent = (session: ExtendedSession | null = defaultSession) =>
  render(<EditSignupPage />, { session });

// Mock getSession return value
(nextAuth as any).getSession = jest.fn().mockReturnValue(defaultSession);

test.skip('page is accessible', async () => {
  const { container } = renderComponent();

  await findFirstNameInput();
  expect(await axe(container)).toHaveNoViolations();
});

const defaultMocks = [
  ...mockedLanguagesResponses,
  rest.get(`*/registration/${TEST_REGISTRATION_ID}/`, (req, res, ctx) =>
    res(ctx.status(200), ctx.json(registration))
  ),
  rest.get(`*/signup/*`, (req, res, ctx) =>
    res(ctx.status(200), ctx.json(signup))
  ),
];

const pushEditSignupRoute = (registrationId: string) => {
  singletonRouter.push({
    pathname: ROUTES.EDIT_SIGNUP,
    query: {
      registrationId: registrationId,
      signupId: TEST_SIGNUP_ID,
    },
  });
};

test('should edit signup page field', async () => {
  setQueryMocks(...defaultMocks);
  pushEditSignupRoute(TEST_REGISTRATION_ID);
  renderComponent();

  await actWait(100);
  await shouldRenderSignupFormFields();
});

test('should cancel signup', async () => {
  setQueryMocks(
    ...defaultMocks,
    rest.delete(`*/signup/${TEST_SIGNUP_ID}`, (req, res, ctx) =>
      res(ctx.status(201), ctx.json(null))
    )
  );
  pushEditSignupRoute(TEST_REGISTRATION_ID);
  renderComponent();

  await findFirstNameInput();
  await tryToCancel();

  await waitFor(() =>
    expect(mockRouter.asPath).toBe(
      `/fi/registration/${TEST_REGISTRATION_ID}/signup/cancelled`
    )
  );
});

test('should show error message when cancelling signup fails', async () => {
  setQueryMocks(
    ...defaultMocks,
    rest.delete(`*/signup/${TEST_SIGNUP_ID}`, (req, res, ctx) =>
      res(ctx.status(403), ctx.json({ detail: 'Malformed UUID.' }))
    )
  );
  pushEditSignupRoute(TEST_REGISTRATION_ID);
  renderComponent();

  await findFirstNameInput();
  await tryToCancel();

  await screen.findByRole(
    'heading',
    { name: /lomakkeella on seuraavat virheet/i },
    { timeout: 10000 }
  );
});

test('should update signup', async () => {
  toast.success = jest.fn();
  setQueryMocks(
    ...defaultMocks,
    rest.put(`*/signup/${TEST_SIGNUP_ID}`, (req, res, ctx) =>
      res(ctx.status(201), ctx.json(signup))
    )
  );
  pushEditSignupRoute(TEST_REGISTRATION_ID);
  renderComponent();

  await findFirstNameInput();
  await tryToUpdate();

  await waitFor(() =>
    expect(toast.success).toBeCalledWith('Osallistujan tiedot on tallennettu')
  );
});

test('should show error message when updating signup fails', async () => {
  setQueryMocks(
    ...defaultMocks,
    rest.put(`*/signup/${TEST_SIGNUP_ID}`, (req, res, ctx) =>
      res(ctx.status(403), ctx.json({ name: 'Name is required.' }))
    )
  );
  pushEditSignupRoute(TEST_REGISTRATION_ID);
  renderComponent();

  await findFirstNameInput();
  await tryToUpdate();

  await screen.findByRole(
    'heading',
    { name: /lomakkeella on seuraavat virheet/i },
    { timeout: 10000 }
  );
});

test('should show not found page if registration does not exist', async () => {
  setQueryMocks(
    rest.get(`*/registration/not-found/`, (req, res, ctx) =>
      res(ctx.status(404), ctx.json({ errorMessage: 'Not found' }))
    ),
    rest.get(`*/signup/*`, (req, res, ctx) =>
      res(ctx.status(200), ctx.json(signup))
    )
  );
  pushEditSignupRoute('not-found');
  renderComponent();

  await loadingSpinnerIsNotInDocument();

  await screen.findByRole('heading', {
    name: 'Valitettavasti etsimääsi sivua ei löydy',
  });

  screen.getByText(
    'Hakemaasi sivua ei löytynyt. Yritä myöhemmin uudelleen. Jos ongelma jatkuu, ota meihin yhteyttä.'
  );
});

test('should show authentication required page if user is not authenticated', async () => {
  setQueryMocks(...defaultMocks);
  pushEditSignupRoute(TEST_REGISTRATION_ID);
  renderComponent(null);

  await loadingSpinnerIsNotInDocument();

  await screen.findByRole('heading', { name: 'Kirjautuminen vaaditaan' });

  screen.getByText(
    'Sinun tulee olla kirjautunut tarkastellaksesi ilmoittautumisen tietoja.'
  );
});
