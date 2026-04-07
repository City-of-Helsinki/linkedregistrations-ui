/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable max-len */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { http, HttpResponse } from 'msw';
import { NextParsedUrlQuery } from 'next/dist/server/request-meta';
import singletonRouter from 'next/router';
import * as nextAuth from 'next-auth/react';
import mockRouter from 'next-router-mock';
import React from 'react';
import { axe } from 'vitest-axe';

import { ExtendedSession } from '../../../types';
import { fakeOffers } from '../../../utils/mockDataUtils';
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
import { signupGroup } from '../../signupGroup/__mocks__/signupGroup';
import {
  findFirstNameInputs,
  getSignupFormElement,
  shouldRenderSignupFormFields,
  shouldRenderSignupFormReadOnlyFields,
  tryToCancel,
  tryToUpdate,
} from '../../signupGroup/testUtils';
import { SIGNUPS_SEARCH_PARAMS } from '../../singups/constants';
import { mockedUserResponse } from '../../user/__mocks__/user';
import { signup } from '../__mocks__/signup';
import { TEST_SIGNUP_ID } from '../constants';
import EditSignupPage from '../EditSignupPage';

configure({ defaultHidden: true });

vi.mock('next/dist/client/router', () => require('next-router-mock'));

const defaultSession = fakeAuthenticatedSession();
const renderComponent = (session: ExtendedSession | null = defaultSession) =>
  render(<EditSignupPage />, { session });

// Mock getSession return value
(nextAuth as any).getSession = vi.fn().mockReturnValue(defaultSession);

test.skip('page is accessible', async () => {
  const { container } = renderComponent();

  await findFirstNameInputs();
  expect(await axe(container)).toHaveNoViolations();
});

const mockedRegistrationResponse = http.get(
  `*/registration/${TEST_REGISTRATION_ID}/`,
  () =>
    HttpResponse.json({
      ...registration,
      event: {
        ...registration.event,
        offers: fakeOffers(1, [{ is_free: true }]),
      },
    })
);
const mockedSignupResponse = http.get(`*/signup/*`, () =>
  HttpResponse.json(signup)
);
const mockedSignupNotCreatedByUserResponse = http.get(`*/signup/*`, () =>
  HttpResponse.json({ ...signup, is_created_by_current_user: false })
);
const mockedSignupWithGroupResponse = http.get(`*/signup/*`, () =>
  HttpResponse.json({ ...signup, signup_group: signupGroup.id })
);
const mockedSignupGroupResponse = http.get(`*/signup_group/*`, () =>
  HttpResponse.json(signupGroup)
);

const commonMocks = [
  ...mockedLanguagesResponses,
  mockedUserResponse,
  mockedSignupResponse,
];

const defaultMocks = [...commonMocks, mockedRegistrationResponse];

const pushEditSignupRoute = (
  registrationId: string,
  query?: NextParsedUrlQuery
) => {
  singletonRouter.push({
    pathname: ROUTES.EDIT_SIGNUP,
    query: {
      ...query,
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
    http.delete(
      `*/signup/${TEST_SIGNUP_ID}`,
      () => new HttpResponse(null, { status: 201 })
    )
  );
  pushEditSignupRoute(TEST_REGISTRATION_ID);
  renderComponent();

  await findFirstNameInputs();
  await tryToCancel();

  await waitFor(() =>
    expect(mockRouter.asPath).toBe(
      `/fi/registration/${TEST_REGISTRATION_ID}/signup/cancelled`
    )
  );
});

test('should disable cancel button if event is already started', async () => {
  const mockedRegistrationWithOnGoingEventResponse = http.get(
    `*/registration/${TEST_REGISTRATION_ID}/`,
    () => HttpResponse.json(registrationWithOnGoingEvent)
  );
  setQueryMocks(...commonMocks, mockedRegistrationWithOnGoingEventResponse);
  pushEditSignupRoute(TEST_REGISTRATION_ID);
  renderComponent();

  await findFirstNameInputs();
  const cancelButton = await getSignupFormElement('cancelButton');
  expect(cancelButton).toBeDisabled();
});

test('should show error message when cancelling signup fails', async () => {
  setQueryMocks(
    ...defaultMocks,
    http.delete(`*/signup/${TEST_SIGNUP_ID}`, () =>
      HttpResponse.json({ detail: 'Malformed UUID.' }, { status: 403 })
    )
  );
  pushEditSignupRoute(TEST_REGISTRATION_ID);
  renderComponent();

  await findFirstNameInputs();
  await tryToCancel();

  await screen.findByRole(
    'heading',
    { name: /lomakkeella on seuraavat virheet/i },
    { timeout: 10000 }
  );
});

test('should update signup', async () => {
  setQueryMocks(
    ...defaultMocks,
    http.put(`*/signup/${TEST_SIGNUP_ID}`, () =>
      HttpResponse.json(signup, { status: 201 })
    )
  );
  pushEditSignupRoute(TEST_REGISTRATION_ID);
  renderComponent();

  await findFirstNameInputs();
  await tryToUpdate();

  await screen.findByRole('alert', {
    name: 'Osallistujan tiedot on tallennettu',
  });
});

test('all fields should be read-only if signup is not created by user', async () => {
  setQueryMocks(
    ...mockedLanguagesResponses,
    mockedUserResponse,
    mockedRegistrationResponse,
    mockedSignupNotCreatedByUserResponse
  );
  pushEditSignupRoute(TEST_REGISTRATION_ID);
  renderComponent();

  await shouldRenderSignupFormReadOnlyFields();

  expect(
    screen.queryByRole('button', { name: /tallenna/i })
  ).not.toBeInTheDocument();
});

test('should not show back button if returnPath is not defined', async () => {
  setQueryMocks(...defaultMocks);
  pushEditSignupRoute(TEST_REGISTRATION_ID);
  renderComponent();

  await findFirstNameInputs();
  expect(
    screen.queryByRole('button', { name: 'Takaisin' })
  ).not.toBeInTheDocument();
});

test('should route to page defined in returnPath when clicking back button', async () => {
  const user = userEvent.setup();
  setQueryMocks(
    ...mockedLanguagesResponses,
    mockedUserResponse,
    mockedRegistrationResponse,
    mockedSignupNotCreatedByUserResponse
  );
  pushEditSignupRoute(TEST_REGISTRATION_ID, {
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

test('contact person fields should be disabled if signup has a signup group', async () => {
  setQueryMocks(
    ...mockedLanguagesResponses,
    mockedUserResponse,
    mockedRegistrationResponse,
    mockedSignupWithGroupResponse,
    mockedSignupGroupResponse
  );

  pushEditSignupRoute(TEST_REGISTRATION_ID);
  renderComponent();

  const firstNameInput = (await findFirstNameInputs())[1];
  const emailInput = getSignupFormElement('emailInput');
  const contactPersonPhoneInput = getSignupFormElement(
    'contactPersonPhoneInput'
  );
  const lastNameInput = screen.getAllByLabelText(/sukunimi/i)[1];
  const membershipNumberInput = getSignupFormElement('membershipNumberInput');
  const nativeLanguageButton = getSignupFormElement('nativeLanguageButton');
  const serviceLanguageButton = getSignupFormElement('serviceLanguageButton');

  expect(
    screen.getByRole('heading', {
      name: /yhteyshenkilön tietoja ei voi muokata/i,
    })
  ).toBeInTheDocument();
  expect(
    screen.getByText(
      'Osallistujaryhmän yhteyshenkilön tietoja ei voi muokata tältä sivulta. Yhteystietoja voi muokata osallistujaryhmän muokkaussivulta.'
    )
  ).toBeInTheDocument();
  expect(
    screen.getByRole('link', { name: /muokkaa osallistujaryhmää/i })
  ).toBeInTheDocument();

  expect(emailInput).toBeDisabled();
  expect(contactPersonPhoneInput).toBeDisabled();
  expect(firstNameInput).toBeDisabled();
  expect(lastNameInput).toBeDisabled();
  expect(membershipNumberInput).toBeDisabled();

  expect(nativeLanguageButton.getAttribute('aria-disabled')).toEqual('true');
  expect(serviceLanguageButton.getAttribute('aria-disabled')).toEqual('true');
});

test('should show error message when updating signup fails', async () => {
  setQueryMocks(
    ...defaultMocks,
    http.put(`*/signup/${TEST_SIGNUP_ID}`, () =>
      HttpResponse.json({ name: 'Name is required.' }, { status: 403 })
    )
  );
  pushEditSignupRoute(TEST_REGISTRATION_ID);
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
    http.get(`*/registration/not-found/`, () =>
      HttpResponse.json({ errorMessage: 'Not found' }, { status: 404 })
    ),
    http.get(`*/signup/*`, () => HttpResponse.json(signup))
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
