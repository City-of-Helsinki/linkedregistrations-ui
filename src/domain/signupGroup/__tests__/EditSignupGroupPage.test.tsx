/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
import '@testing-library/jest-dom';
import { axe } from 'jest-axe';
import { rest } from 'msw';
import { NextParsedUrlQuery } from 'next/dist/server/request-meta';
import singletonRouter from 'next/router';
import * as nextAuth from 'next-auth/react';
import mockRouter from 'next-router-mock';
import React from 'react';

import { ExtendedSession } from '../../../types';
import { fakeAuthenticatedSession } from '../../../utils/mockSession';
import {
  actWait,
  configure,
  loadingSpinnerIsNotInDocument,
  render,
  screen,
  setQueryMocks,
  userEvent,
  waitFor,
} from '../../../utils/testUtils';
import { ROUTES } from '../../app/routes/constants';
import { mockedLanguagesResponses } from '../../language/__mocks__/languages';
import {
  registration,
  registrationWithOnGoingEvent,
} from '../../registration/__mocks__/registration';
import { TEST_REGISTRATION_ID } from '../../registration/constants';
import { SIGNUPS_SEARCH_PARAMS } from '../../singups/constants';
import { mockedUserResponse } from '../../user/__mocks__/user';
import { signupGroup } from '../__mocks__/signupGroup';
import { TEST_SIGNUP_GROUP_ID } from '../constants';
import EditSignupGroupPage from '../EditSignupGroupPage';
import {
  findFirstNameInputs,
  getSignupFormElement,
  shouldRenderSignupFormFields,
  shouldRenderSignupFormReadOnlyFields,
  tryToCancel,
  tryToUpdate,
} from '../testUtils';

configure({ defaultHidden: true });

jest.mock('next/dist/client/router', () => require('next-router-mock'));

const defaultSession = fakeAuthenticatedSession();
const renderComponent = (session: ExtendedSession | null = defaultSession) =>
  render(<EditSignupGroupPage />, { session });

// Mock getSession return value
(nextAuth as any).getSession = jest.fn().mockReturnValue(defaultSession);

test.skip('page is accessible', async () => {
  const { container } = renderComponent();

  await findFirstNameInputs();
  expect(await axe(container)).toHaveNoViolations();
});

const mockedRegistrationResponse = rest.get(
  `*/registration/${TEST_REGISTRATION_ID}/`,
  (req, res, ctx) => res(ctx.status(200), ctx.json(registration))
);
const mockedSignupsGroupResponse = rest.get(
  `*/signup_group/*`,
  (req, res, ctx) => res(ctx.status(200), ctx.json(signupGroup))
);
const mockedSignupGroupNotCreatedByUserResponse = rest.get(
  `*/signup_group/*`,
  (req, res, ctx) =>
    res(
      ctx.status(200),
      ctx.json({ ...signupGroup, is_created_by_current_user: false })
    )
);

const commonMocks = [
  ...mockedLanguagesResponses,
  mockedUserResponse,
  mockedSignupsGroupResponse,
];

const defaultMocks = [...commonMocks, mockedRegistrationResponse];

const pushEditSignupGroupRoute = (
  registrationId: string,
  query?: NextParsedUrlQuery
) => {
  singletonRouter.push({
    pathname: ROUTES.EDIT_SIGNUP,
    query: {
      ...query,
      registrationId: registrationId,
      signupId: TEST_SIGNUP_GROUP_ID,
    },
  });
};

test('should render signup group edit page field', async () => {
  setQueryMocks(...defaultMocks);
  pushEditSignupGroupRoute(TEST_REGISTRATION_ID);
  renderComponent();

  await actWait(100);
  await shouldRenderSignupFormFields();
});

test('should cancel signup group', async () => {
  setQueryMocks(
    ...defaultMocks,
    rest.delete(`*/signup_group/${TEST_SIGNUP_GROUP_ID}`, (req, res, ctx) =>
      res(ctx.status(201), ctx.json(null))
    )
  );
  pushEditSignupGroupRoute(TEST_REGISTRATION_ID);
  renderComponent();

  await findFirstNameInputs();
  await tryToCancel();

  await waitFor(() =>
    expect(mockRouter.asPath).toBe(
      `/fi/registration/${TEST_REGISTRATION_ID}/signup-group/cancelled`
    )
  );
});

test('should disable cancel button if event is already started', async () => {
  const mockedRegistrationWithOnGoingEventResponse = rest.get(
    `*/registration/${TEST_REGISTRATION_ID}/`,
    (req, res, ctx) =>
      res(ctx.status(200), ctx.json(registrationWithOnGoingEvent))
  );
  setQueryMocks(...commonMocks, mockedRegistrationWithOnGoingEventResponse);
  pushEditSignupGroupRoute(TEST_REGISTRATION_ID);
  renderComponent();

  await findFirstNameInputs();
  const cancelButton = await getSignupFormElement('cancelButton');
  expect(cancelButton).toBeDisabled();
});

test('should show error message when cancelling signup group fails', async () => {
  setQueryMocks(
    ...defaultMocks,
    rest.delete(`*/signup_group/${TEST_SIGNUP_GROUP_ID}`, (req, res, ctx) =>
      res(ctx.status(403), ctx.json({ detail: 'Malformed UUID.' }))
    )
  );
  pushEditSignupGroupRoute(TEST_REGISTRATION_ID);
  renderComponent();

  await findFirstNameInputs();
  await tryToCancel();

  await screen.findByRole(
    'heading',
    { name: /lomakkeella on seuraavat virheet/i },
    { timeout: 10000 }
  );
});

test('should update signup group', async () => {
  setQueryMocks(
    ...defaultMocks,
    rest.put(`*/signup_group/${TEST_SIGNUP_GROUP_ID}`, (req, res, ctx) =>
      res(ctx.status(201), ctx.json(signupGroup))
    )
  );
  pushEditSignupGroupRoute(TEST_REGISTRATION_ID);
  renderComponent();

  await findFirstNameInputs();
  await tryToUpdate();

  await screen.findByRole('alert', {
    name: 'Osallistujien tiedot on tallennettu',
  });
});

test('should not show back button if returnPath is not defined', async () => {
  setQueryMocks(...defaultMocks);
  pushEditSignupGroupRoute(TEST_REGISTRATION_ID);
  renderComponent();

  await findFirstNameInputs();
  expect(
    screen.queryByRole('button', { name: 'Takaisin' })
  ).not.toBeInTheDocument();
});

test('should route to page defined in returnPath when clicking back button', async () => {
  const user = userEvent.setup();
  setQueryMocks(...defaultMocks);
  pushEditSignupGroupRoute(TEST_REGISTRATION_ID, {
    [SIGNUPS_SEARCH_PARAMS.RETURN_PATH]: ROUTES.SIGNUPS.replace(
      '[registrationId]',
      TEST_REGISTRATION_ID
    ),
  });
  renderComponent();

  await findFirstNameInputs();
  const backButton = screen.getByRole('button', { name: 'Takaisin' });
  await user.click(backButton);
  expect(mockRouter.asPath).toBe(
    `/registration/${TEST_REGISTRATION_ID}/signup`
  );
});

test('all fields should be read-only if signup is not created by user', async () => {
  setQueryMocks(
    ...mockedLanguagesResponses,
    mockedUserResponse,
    mockedRegistrationResponse,
    mockedSignupGroupNotCreatedByUserResponse
  );
  pushEditSignupGroupRoute(TEST_REGISTRATION_ID);
  renderComponent();

  await shouldRenderSignupFormReadOnlyFields();

  expect(
    screen.queryByRole('button', { name: /tallenna/i })
  ).not.toBeInTheDocument();
});

test('should route to the first page defined in returnPath when clicking back button', async () => {
  const user = userEvent.setup();
  setQueryMocks(...defaultMocks);
  pushEditSignupGroupRoute(TEST_REGISTRATION_ID, {
    [SIGNUPS_SEARCH_PARAMS.RETURN_PATH]: [
      ROUTES.SIGNUPS.replace('[registrationId]', TEST_REGISTRATION_ID),
      'test',
    ],
  });
  renderComponent();

  await findFirstNameInputs();
  const backButton = screen.getByRole('button', { name: 'Takaisin' });
  await user.click(backButton);
  expect(mockRouter.asPath).toBe(
    `/registration/${TEST_REGISTRATION_ID}/signup`
  );
});

test('should show error message when updating signup group fails', async () => {
  setQueryMocks(
    ...defaultMocks,
    rest.put(`*/signup_group/${TEST_SIGNUP_GROUP_ID}`, (req, res, ctx) =>
      res(ctx.status(403), ctx.json({ name: 'Name is required.' }))
    )
  );
  pushEditSignupGroupRoute(TEST_REGISTRATION_ID);
  renderComponent();

  await findFirstNameInputs();
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
    rest.get(`*/signup_group/*`, (req, res, ctx) =>
      res(ctx.status(200), ctx.json(signupGroup))
    )
  );
  pushEditSignupGroupRoute('not-found');
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
  pushEditSignupGroupRoute(TEST_REGISTRATION_ID);
  renderComponent(null);

  await loadingSpinnerIsNotInDocument();

  await screen.findByRole('heading', { name: 'Kirjautuminen vaaditaan' });

  screen.getByText(
    'Sinun tulee olla kirjautunut tarkastellaksesi ilmoittautumisen tietoja.'
  );
});
