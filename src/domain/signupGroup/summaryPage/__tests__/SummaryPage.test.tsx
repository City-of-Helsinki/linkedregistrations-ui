/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
import subDays from 'date-fns/subDays';
import subYears from 'date-fns/subYears';
import { rest } from 'msw';
import singletonRouter from 'next/router';
import * as nextAuth from 'next-auth/react';
import mockRouter from 'next-router-mock';
import React from 'react';

import { FORM_NAMES, RESERVATION_NAMES } from '../../../../constants';
import { ExtendedSession } from '../../../../types';
import formatDate from '../../../../utils/formatDate';
import {
  fakeSignupPayment,
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
import {
  registration,
  registrationWithPriceGroup,
} from '../../../registration/__mocks__/registration';
import { TEST_REGISTRATION_ID } from '../../../registration/constants';
import { TEST_SIGNUP_ID } from '../../../signup/constants';
import { mockedUserResponse } from '../../../user/__mocks__/user';
import {
  NOTIFICATIONS,
  TEST_REGISTRATION_PRICE_GROUP_ID,
  TEST_SIGNUP_GROUP_ID,
} from '../../constants';
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
const signupWithPayment = fakeSignup({
  id: TEST_SIGNUP_ID,
  payment: fakeSignupPayment({ logged_in_checkout_url: 'https://payment.com' }),
});

const signupGroup = fakeSignupGroup({
  id: TEST_SIGNUP_GROUP_ID,
  signups: [signup, fakeSignup()],
});

const signupGroupWithPayment = fakeSignupGroup({
  id: TEST_SIGNUP_GROUP_ID,
  signups: [signup, fakeSignup()],
  payment: fakeSignupPayment({ logged_in_checkout_url: 'https://payment.com' }),
});

const signupValues = {
  city: 'City',
  dateOfBirth: formatDate(subYears(new Date(), 9)),
  extraInfo: '',
  firstName: 'First name',
  id: null,
  inWaitingList: false,
  lastName: 'Last name',
  phoneNumber: '+358 44 123 4567',
  priceGroup: '',
  streetAddress: 'Street address',
  zipcode: '00100',
};

const signupWithPriceGroupValues = {
  city: 'City',
  dateOfBirth: formatDate(subYears(new Date(), 9)),
  extraInfo: '',
  firstName: 'First name',
  id: null,
  inWaitingList: false,
  lastName: 'Last name',
  phoneNumber: '+358 44 123 4567',
  priceGroup: TEST_REGISTRATION_PRICE_GROUP_ID.toString(),
  streetAddress: 'Street address',
  zipcode: '00100',
};

const contactPersonValues = {
  email: 'participant@email.com',
  firstName: 'First name',
  id: null,
  lastName: 'Last name',
  membershipNumber: '',
  nativeLanguage: 'fi',
  notifications: [NOTIFICATIONS.EMAIL],
  phoneNumber: '+358 44 123 4567',
  serviceLanguage: 'fi',
};

const commonSignupGroupValues = {
  contactPerson: contactPersonValues,
  extraInfo: '',
  signups: [
    {
      city: 'City',
      dateOfBirth: formatDate(subYears(new Date(), 9)),
      extraInfo: '',
      firstName: 'First name',
      id: null,
      inWaitingList: false,
      lastName: 'Last name',
      phoneNumber: '+358 44 123 4567',
      streetAddress: 'Street address',
      zipcode: '00100',
    },
  ],
  userConsent: true,
};

const signupGroupWithSingleSignupValues: SignupGroupFormFields = {
  ...commonSignupGroupValues,
  signups: [{ ...signupValues }],
};

const signupGroupWithSignupWithPriceGroupValues: SignupGroupFormFields = {
  ...commonSignupGroupValues,
  signups: [{ ...signupWithPriceGroupValues }],
};

const signupGroupValues: SignupGroupFormFields = {
  ...commonSignupGroupValues,
  contactPerson: contactPersonValues,
  signups: [signupValues, signupValues],
};

const signupGroupWithPaymentValues: SignupGroupFormFields = {
  ...commonSignupGroupValues,
  signups: [signupWithPriceGroupValues, signupWithPriceGroupValues],
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

const getPaymentButton = () => {
  return screen.getByRole('button', { name: /siirry maksamaan/i });
};

const expectSessionStorageToBeCleared = (registrationId: string) => {
  expect(sessionStorage.removeItem).toHaveBeenCalledWith(
    `${FORM_NAMES.CREATE_SIGNUP_GROUP_FORM}-${registrationId}`
  );
  expect(sessionStorage.removeItem).toHaveBeenCalledWith(
    `${RESERVATION_NAMES.SIGNUP_RESERVATION}-${registrationId}`
  );
};

const testMovingToSignupCompletedSite = async ({
  expectedRoute,
  registrationId,
}: {
  expectedRoute: string;
  registrationId: string;
}) => {
  const user = userEvent.setup();

  await loadingSpinnerIsNotInDocument();

  const submitButton = getSubmitButton();
  await user.click(submitButton);

  await waitFor(() => expect(mockRouter.asPath).toBe(expectedRoute));
  expectSessionStorageToBeCleared(registrationId);
};

const testMovingToPaymentSite = async ({
  registrationId,
}: {
  registrationId: string;
}) => {
  const user = userEvent.setup();

  renderComponent();

  await loadingSpinnerIsNotInDocument();

  const submitButton = getPaymentButton();
  await user.click(submitButton);

  await waitFor(() =>
    expect(window.open).toBeCalledWith(
      'https://payment.com',
      '_self',
      'noopener,noreferrer'
    )
  );
  expectSessionStorageToBeCleared(registrationId);
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
    signupGroupFormValues: {
      ...signupGroupValues,
      contactPerson: { ...signupGroupValues.contactPerson, email: '' },
    },
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

  await testMovingToSignupCompletedSite({
    expectedRoute: `/registration/${registration.id}/signup/${TEST_SIGNUP_ID}/completed`,
    registrationId: registration.id,
  });
});

test('should route to payment service after creating chargeable signup', async () => {
  window.open = jest.fn();
  setQueryMocks(
    ...mockedLanguagesResponses,
    mockedUserResponse,
    rest.get(`*/registration/${TEST_REGISTRATION_ID}/`, (req, res, ctx) =>
      res(ctx.status(200), ctx.json(registrationWithPriceGroup))
    ),
    rest.post(`*/signup/`, (req, res, ctx) =>
      res(ctx.status(201), ctx.json([signupWithPayment]))
    )
  );

  setSignupGroupFormSessionStorageValues({
    registrationId: registrationWithPriceGroup.id,
    seatsReservation: getMockedSeatsReservationData(1000),
    signupGroupFormValues: signupGroupWithSignupWithPriceGroupValues,
  });

  pushSummaryPageRoute(registrationWithPriceGroup.id);
  await testMovingToPaymentSite({
    registrationId: registrationWithPriceGroup.id,
  });
});

test('should show server errors when creating signup request fails', async () => {
  const user = userEvent.setup();
  setQueryMocks(
    ...defaultMocks,
    rest.post(`*/signup/`, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({ city: ['Tämän kentän arvo ei voi olla "null".'] })
      )
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

  await screen.findByText(/lomakkeella on seuraavat virheet/i);
});

test('should route to signup group completed page', async () => {
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

  await testMovingToSignupCompletedSite({
    expectedRoute: `/registration/${registration.id}/signup-group/${TEST_SIGNUP_GROUP_ID}/completed`,
    registrationId: registration.id,
  });
});

test('should route to payment service after creating chargeable signup group', async () => {
  window.open = jest.fn();
  setQueryMocks(
    ...mockedLanguagesResponses,
    mockedUserResponse,
    rest.get(`*/registration/${TEST_REGISTRATION_ID}/`, (req, res, ctx) =>
      res(ctx.status(200), ctx.json(registrationWithPriceGroup))
    ),
    rest.post(`*/signup_group/`, (req, res, ctx) =>
      res(ctx.status(201), ctx.json(signupGroupWithPayment))
    )
  );

  setSignupGroupFormSessionStorageValues({
    registrationId: registrationWithPriceGroup.id,
    seatsReservation: getMockedSeatsReservationData(1000),
    signupGroupFormValues: signupGroupWithPaymentValues,
  });

  pushSummaryPageRoute(registrationWithPriceGroup.id);
  await testMovingToPaymentSite({
    registrationId: registrationWithPriceGroup.id,
  });
});

test('should show server errors when creating signup group request fails', async () => {
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

test('should show sign up is closed text if enrolment end date is in the past', async () => {
  setQueryMocks(
    rest.get(`*/registration/${TEST_REGISTRATION_ID}/`, (req, res, ctx) =>
      res(
        ctx.status(200),
        ctx.json({
          ...registration,
          enrolment_end_time: subDays(new Date(), 2).toISOString(),
        })
      )
    )
  );

  pushSummaryPageRoute(TEST_REGISTRATION_ID);
  renderComponent();

  await loadingSpinnerIsNotInDocument();

  await screen.findByRole('heading', {
    name: /ilmoittautuminen tapahtumaan on päättynyt/i,
  });
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
