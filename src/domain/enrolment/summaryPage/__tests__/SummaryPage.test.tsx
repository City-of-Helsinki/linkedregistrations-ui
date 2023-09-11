/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
import subYears from 'date-fns/subYears';
import { rest } from 'msw';
import * as nextAuth from 'next-auth/react';
import mockRouter from 'next-router-mock';
import singletonRouter from 'next/router';
import React from 'react';

import { ExtendedSession } from '../../../../types';
import formatDate from '../../../../utils/formatDate';
import {
  fakeEnrolment,
  fakeSignupGroup,
  getMockedSeatsReservationData,
  setEnrolmentFormSessionStorageValues,
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
import { NOTIFICATIONS } from '../../constants';
import { EnrolmentFormFields } from '../../types';
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

const signup = fakeEnrolment();

const signupGroup = fakeSignupGroup({ signups: [signup] });

const enrolmentValues: EnrolmentFormFields = {
  accepted: true,
  attendees: [
    {
      city: 'City',
      dateOfBirth: formatDate(subYears(new Date(), 9)),
      extraInfo: '',
      firstName: 'First name',
      inWaitingList: false,
      lastName: 'Last name',
      streetAddress: 'Street address',
      zipcode: '00100',
    },
  ],
  email: 'participant@email.com',
  extraInfo: '',
  membershipNumber: '',
  nativeLanguage: 'fi',
  notifications: [NOTIFICATIONS.EMAIL],
  phoneNumber: '+358 44 123 4567',
  serviceLanguage: 'fi',
};

const defaultMocks = [
  ...mockedLanguagesResponses,
  rest.get(`*/registration/${TEST_REGISTRATION_ID}/`, (req, res, ctx) =>
    res(ctx.status(200), ctx.json(registration))
  ),
];

const renderComponent = (session: ExtendedSession | null = defaultSession) =>
  render(<SummaryPage />, { session });

const getSubmitButton = () => {
  return screen.getByRole('button', { name: /lähetä ilmoittautuminen/i });
};

test('should route back to enrolment form if reservation data is missing', async () => {
  setQueryMocks(...defaultMocks);

  setEnrolmentFormSessionStorageValues({
    enrolmentFormValues: enrolmentValues,
    registrationId: registration.id,
  });

  singletonRouter.push({
    pathname: ROUTES.CREATE_ENROLMENT_SUMMARY,
    query: { registrationId: registration.id },
  });
  renderComponent();

  await loadingSpinnerIsNotInDocument();

  await waitFor(() =>
    expect(mockRouter.asPath).toBe(
      `/registration/${registration.id}/enrolment/create`
    )
  );
});

test('should route back to enrolment form after clicking submit button if there are any validation errors', async () => {
  const user = userEvent.setup();
  setQueryMocks(...defaultMocks);

  setEnrolmentFormSessionStorageValues({
    enrolmentFormValues: { ...enrolmentValues, email: '' },
    registrationId: registration.id,
    seatsReservation: getMockedSeatsReservationData(1000),
  });

  singletonRouter.push({
    pathname: ROUTES.CREATE_ENROLMENT_SUMMARY,
    query: { registrationId: registration.id },
  });
  renderComponent();

  await loadingSpinnerIsNotInDocument();

  const submitButton = getSubmitButton();
  await user.click(submitButton);

  await waitFor(() =>
    expect(mockRouter.asPath).toBe(
      `/registration/${registration.id}/enrolment/create`
    )
  );
});

test('should route to enrolment completed page', async () => {
  const user = userEvent.setup();
  setQueryMocks(
    ...defaultMocks,
    rest.post(`*/signup_group/`, (req, res, ctx) =>
      res(ctx.status(201), ctx.json(signupGroup))
    )
  );

  setEnrolmentFormSessionStorageValues({
    enrolmentFormValues: enrolmentValues,
    registrationId: registration.id,
    seatsReservation: getMockedSeatsReservationData(1000),
  });

  singletonRouter.push({
    pathname: ROUTES.CREATE_ENROLMENT_SUMMARY,
    query: { registrationId: registration.id },
  });
  renderComponent();

  await loadingSpinnerIsNotInDocument();

  const submitButton = getSubmitButton();
  await user.click(submitButton);

  await waitFor(() =>
    expect(mockRouter.asPath).toBe(
      `/registration/${registration.id}/enrolment/completed`
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

  setEnrolmentFormSessionStorageValues({
    enrolmentFormValues: enrolmentValues,
    registrationId: registration.id,
    seatsReservation: getMockedSeatsReservationData(1000),
  });

  singletonRouter.push({
    pathname: ROUTES.CREATE_ENROLMENT_SUMMARY,
    query: { registrationId: registration.id },
  });
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

  singletonRouter.push({
    pathname: ROUTES.CREATE_ENROLMENT_SUMMARY,
    query: { registrationId: 'not-found' },
  });
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
  singletonRouter.push({
    pathname: ROUTES.CREATE_ENROLMENT_SUMMARY,
    query: { registrationId: registration.id },
  });

  renderComponent(null);

  await loadingSpinnerIsNotInDocument();

  await screen.findByRole('heading', { name: 'Kirjaudu sisään' });
  screen.getByText(
    'Sinun täytyy kirjautua sisään ilmoittautuaksesi tähän tapahtumaan.'
  );
});
