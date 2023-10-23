/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
import subYears from 'date-fns/subYears';
import { rest } from 'msw';
import singletonRouter from 'next/router';
import * as nextAuth from 'next-auth/react';
import mockRouter from 'next-router-mock';
import React from 'react';

import { ExtendedSession } from '../../../../types';
import formatDate from '../../../../utils/formatDate';
import {
  fakeSignup,
  fakeSignupGroup,
  getMockedSeatsReservationData,
  setSignupGroupFormSessionStorageValues,
} from '../../../../utils/mockDataUtils';
import { fakeAuthenticatedSession } from '../../../../utils/mockSession';
import {
  loadingSpinnerIsNotInDocument,
  render,
  screen,
  setQueryMocks,
  userEvent,
  waitFor,
} from '../../../../utils/testUtils';
import { ROUTES } from '../../../app/routes/constants';
import { mockedLanguagesResponses } from '../../../language/__mocks__/languages';
import { registration } from '../../../registration/__mocks__/registration';
import { TEST_REGISTRATION_ID } from '../../../registration/constants';
import { TEST_SIGNUP_ID } from '../../../signup/constants';
import { mockedUserResponse } from '../../../user/__mocks__/user';
import { NOTIFICATIONS, TEST_SIGNUP_GROUP_ID } from '../../constants';
import { SignupGroupFormFields } from '../../types';
import SummaryPage from '../SummaryPage';

// eslint-disable-next-line @typescript-eslint/no-require-imports
jest.mock('next/dist/client/router', () => require('next-router-mock'));

const defaultSession = fakeAuthenticatedSession();

beforeEach(() => {
  // Mock getSession return value
  (nextAuth as any).getSession = jest.fn().mockReturnValue(defaultSession);
  // values stored in tests will also be available in other tests unless you run
  localStorage.clear();
  sessionStorage.clear();
});

const signup = fakeSignup({ id: TEST_SIGNUP_ID });

const signupGroup = fakeSignupGroup({
  id: TEST_SIGNUP_GROUP_ID,
  signups: [signup, fakeSignup()],
});

const signupValues = {
  city: 'City',
  dateOfBirth: formatDate(subYears(new Date(), 9)),
  extraInfo: '',
  firstName: 'First name',
  id: null,
  inWaitingList: false,
  lastName: 'Last name',
  responsibleForGroup: true,
  streetAddress: 'Street address',
  zipcode: '00100',
};

const commonSignupGroupValues = {
  accepted: true,
  email: 'participant@email.com',
  extraInfo: '',
  membershipNumber: '',
  nativeLanguage: 'fi',
  notifications: [NOTIFICATIONS.EMAIL],
  phoneNumber: '+358 44 123 4567',
  serviceLanguage: 'fi',
};

const signupGroupWithSingleSignupValues: SignupGroupFormFields = {
  ...commonSignupGroupValues,
  signups: [signupValues],
};

const signupGroupValues: SignupGroupFormFields = {
  ...commonSignupGroupValues,
  signups: [signupValues, signupValues],
};

const defaultMocks = [
  ...mockedLanguagesResponses,
  mockedUserResponse,
  rest.get(`*/registration/${TEST_REGISTRATION_ID}/`, (req, res, ctx) =>
    res(ctx.status(200), ctx.json(registration))
  ),
];

const pushSummaryPageRoute = (registrationId: string) => {
  singletonRouter.push({
    pathname: ROUTES.CREATE_SIGNUP_GROUP_SUMMARY,
    query: { registrationId },
  });
};

const renderComponent = (session: ExtendedSession | null = defaultSession) =>
  render(<SummaryPage />, { session });

const getSubmitButton = () => {
  return screen.getByRole('button', { name: /lähetä ilmoittautuminen/i });
};

test('should route back to signup form if reservation data is missing', async () => {
  setQueryMocks(...defaultMocks);

  setSignupGroupFormSessionStorageValues({
    registrationId: registration.id,
    signupGroupFormValues: signupGroupValues,
  });
  pushSummaryPageRoute(registration.id);
  renderComponent();

  await loadingSpinnerIsNotInDocument();

  await waitFor(() =>
    expect(mockRouter.asPath).toBe(
      `/registration/${registration.id}/signup-group/create`
    )
  );
});

test('should route back to signup form after clicking submit button if there are any validation errors', async () => {
  const user = userEvent.setup();
  setQueryMocks(...defaultMocks);

  setSignupGroupFormSessionStorageValues({
    registrationId: registration.id,
    seatsReservation: getMockedSeatsReservationData(1000),
    signupGroupFormValues: { ...signupGroupValues, email: '' },
  });

  pushSummaryPageRoute(registration.id);
  renderComponent();

  await loadingSpinnerIsNotInDocument();

  const submitButton = getSubmitButton();
  await user.click(submitButton);

  await waitFor(() =>
    expect(mockRouter.asPath).toBe(
      `/registration/${registration.id}/signup-group/create`
    )
  );
});

test('should route to signup completed page', async () => {
  const user = userEvent.setup();
  setQueryMocks(
    ...defaultMocks,
    rest.post(`*/signup/`, (req, res, ctx) =>
      res(ctx.status(201), ctx.json([signup]))
    )
  );

  setSignupGroupFormSessionStorageValues({
    registrationId: registration.id,
    seatsReservation: getMockedSeatsReservationData(1000),
    signupGroupFormValues: signupGroupWithSingleSignupValues,
  });

  pushSummaryPageRoute(registration.id);
  renderComponent();

  await loadingSpinnerIsNotInDocument();

  const submitButton = getSubmitButton();
  await user.click(submitButton);

  await waitFor(() =>
    expect(mockRouter.asPath).toBe(
      `/registration/${registration.id}/signup/${TEST_SIGNUP_ID}/completed`
    )
  );
});

test('should route to signup group completed page', async () => {
  const user = userEvent.setup();
  setQueryMocks(
    ...defaultMocks,
    rest.post(`*/signup_group/`, (req, res, ctx) =>
      res(ctx.status(201), ctx.json(signupGroup))
    )
  );

  setSignupGroupFormSessionStorageValues({
    registrationId: registration.id,
    seatsReservation: getMockedSeatsReservationData(1000),
    signupGroupFormValues: signupGroupValues,
  });

  pushSummaryPageRoute(registration.id);
  renderComponent();

  await loadingSpinnerIsNotInDocument();

  const submitButton = getSubmitButton();
  await user.click(submitButton);

  await waitFor(() =>
    expect(mockRouter.asPath).toBe(
      `/registration/${registration.id}/signup-group/${TEST_SIGNUP_GROUP_ID}/completed`
    )
  );
});

test('should show server errors when post request fails', async () => {
  const user = userEvent.setup();
  setQueryMocks(
    ...defaultMocks,
    rest.post(`*/signup_group/`, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          city: ['Tämän kentän arvo ei voi olla "null".'],
          detail: 'The participant is too old.',
          name: ['Tämän kentän arvo ei voi olla "null".'],
          non_field_errors: [
            'Kenttien email, registration tulee muodostaa uniikki joukko.',
            'Kenttien phone_number, registration tulee muodostaa uniikki joukko.',
          ],
        })
      )
    )
  );

  setSignupGroupFormSessionStorageValues({
    registrationId: registration.id,
    seatsReservation: getMockedSeatsReservationData(1000),
    signupGroupFormValues: signupGroupValues,
  });

  pushSummaryPageRoute(registration.id);
  renderComponent();

  await loadingSpinnerIsNotInDocument();

  const submitButton = getSubmitButton();
  await user.click(submitButton);

  await screen.findByText(/lomakkeella on seuraavat virheet/i);
});

test('should show not found page if registration does not exist', async () => {
  setQueryMocks(
    rest.get(`*/registration/not-found/`, (req, res, ctx) =>
      res(ctx.status(404), ctx.json({ errorMessage: 'Not found' }))
    )
  );

  pushSummaryPageRoute('not-found');
  renderComponent();

  await loadingSpinnerIsNotInDocument();

  await screen.findByRole('heading', {
    name: 'Valitettavasti etsimääsi sivua ei löydy',
  });

  screen.getByText(
    'Hakemaasi sivua ei löytynyt. Yritä myöhemmin uudelleen. Jos ongelma jatkuu, ota meihin yhteyttä.'
  );
});

test('should show authentication required notification', async () => {
  setQueryMocks(...defaultMocks);
  pushSummaryPageRoute(registration.id);

  renderComponent(null);

  await loadingSpinnerIsNotInDocument();

  await screen.findByRole('heading', { name: 'Kirjaudu sisään' });
  screen.getByText(
    'Sinun täytyy kirjautua sisään ilmoittautuaksesi tähän tapahtumaan.'
  );
});

test('should route back to create signup group page', async () => {
  const user = userEvent.setup();
  setQueryMocks(...defaultMocks);
  pushSummaryPageRoute(registration.id);

  renderComponent();

  await loadingSpinnerIsNotInDocument();

  const backToSignupGroupFormButton = screen.getByRole('button', {
    name: /palaa ilmoittautumiskaavakkeeseen/i,
  });
  await user.click(backToSignupGroupFormButton);

  expect(mockRouter.asPath).toBe(
    '/registration/registration:1/signup-group/create'
  );
});
