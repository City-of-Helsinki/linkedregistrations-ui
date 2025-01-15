/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */

import subDays from 'date-fns/subDays';
import subYears from 'date-fns/subYears';
import { axe } from 'jest-axe';
import { rest } from 'msw';
import singletonRouter from 'next/router';
import * as nextAuth from 'next-auth/react';
import mockRouter from 'next-router-mock';
import React from 'react';

import { ExtendedSession } from '../../../types';
import formatDate from '../../../utils/formatDate';
import {
  fakeSeatsReservation,
  getMockedSeatsReservationData,
  setSignupGroupFormSessionStorageValues,
} from '../../../utils/mockDataUtils';
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
  within,
} from '../../../utils/testUtils';
import { ROUTES } from '../../app/routes/constants';
import { mockedLanguagesResponses } from '../../language/__mocks__/languages';
import { registration } from '../../registration/__mocks__/registration';
import { TEST_REGISTRATION_ID } from '../../registration/constants';
import { mockedUserResponse } from '../../user/__mocks__/user';
import CreateSignupGroupPage from '../CreateSignupGroupPage';
import { findFirstNameInputs, getSignupFormElement } from '../testUtils';

configure({ defaultHidden: true });

jest.mock('next/dist/client/router', () => require('next-router-mock'));

const signupValues = {
  city: 'City',
  dateOfBirth: formatDate(subYears(new Date(), 9)),
  email: 'participant@email.com',
  firstName: 'First name',
  lastName: 'Last name',
  phoneNumber: '+358 44 123 4567',
  streetAddress: 'Street address',
  zip: '00100',
};

let seats = 1;
const seatsReservation = fakeSeatsReservation();

const defaultSession = fakeAuthenticatedSession();

const renderComponent = (session: ExtendedSession | null = defaultSession) =>
  render(<CreateSignupGroupPage />, { session });

beforeEach(() => {
  // Mock getSession return value
  (nextAuth as any).getSession = jest.fn().mockReturnValue(defaultSession);
  seats = 1;
  // values stored in tests will also be available in other tests unless you run
  localStorage.clear();
  sessionStorage.clear();
});

const defaultMocks = [
  ...mockedLanguagesResponses,
  mockedUserResponse,
  rest.get(`*/registration/${TEST_REGISTRATION_ID}/`, (req, res, ctx) =>
    res(ctx.status(200), ctx.json(registration))
  ),
];

const pushCreateSignupGroupRoute = (registrationId: string) => {
  singletonRouter.push({
    pathname: ROUTES.CREATE_SIGNUP_GROUP,
    query: { registrationId },
  });
};

test.skip('page is accessible', async () => {
  setQueryMocks(...defaultMocks);
  singletonRouter.push({
    pathname: ROUTES.CREATE_SIGNUP_GROUP,
    query: { registrationId: TEST_REGISTRATION_ID },
  });
  const { container } = renderComponent();

  await findFirstNameInputs();
  expect(await axe(container)).toHaveNoViolations();
});

test('should validate signup group form and focus invalid field', async () => {
  const user = userEvent.setup();

  setQueryMocks(
    ...defaultMocks,
    rest.post(`*/seats_reservation/`, (req, res, ctx) =>
      res(ctx.status(201), ctx.json({ ...seatsReservation, seats }))
    )
  );
  pushCreateSignupGroupRoute(TEST_REGISTRATION_ID);
  renderComponent();

  const firstNameInput = (await findFirstNameInputs())[0];
  const lastNameInput = await getSignupFormElement('lastNameInput');
  const phoneInput = await getSignupFormElement('phoneInput');
  const dateOfBirthInput = getSignupFormElement('dateOfBirthInput');
  const streetAddressInput = getSignupFormElement('streetAddressInput');
  const zipInput = getSignupFormElement('zipInput');
  const cityInput = getSignupFormElement('cityInput');
  const emailInput = getSignupFormElement('emailInput');
  const contactPersonPhoneInput = getSignupFormElement(
    'contactPersonPhoneInput'
  );
  const serviceLanguageButton = getSignupFormElement('serviceLanguageButton');
  const acceptCheckbox = getSignupFormElement('acceptCheckbox');
  const submitButton = getSignupFormElement('submitButton');

  expect(firstNameInput).not.toHaveFocus();

  await user.click(submitButton);
  await waitFor(() => expect(firstNameInput).toHaveFocus());

  await user.type(firstNameInput, signupValues.firstName);
  await user.click(submitButton);
  await waitFor(() => expect(lastNameInput).toHaveFocus());

  await user.type(lastNameInput, signupValues.lastName);
  await user.click(submitButton);
  await waitFor(() => expect(phoneInput).toHaveFocus());

  await user.type(phoneInput, signupValues.phoneNumber);
  await user.click(submitButton);
  await waitFor(() => expect(streetAddressInput).toHaveFocus());

  await user.type(streetAddressInput, signupValues.streetAddress);
  await user.click(submitButton);
  await waitFor(() => expect(dateOfBirthInput).toHaveFocus());

  await user.type(dateOfBirthInput, formatDate(subYears(new Date(), 15)));
  await user.click(submitButton);
  await waitFor(() => expect(zipInput).toHaveFocus());

  await user.type(zipInput, signupValues.zip);
  await user.click(submitButton);
  await waitFor(() => expect(cityInput).toHaveFocus());

  await user.type(cityInput, signupValues.city);
  await user.click(submitButton);
  await waitFor(() => expect(emailInput).toHaveFocus());
  expect(emailInput).toBeRequired();
  expect(contactPersonPhoneInput).not.toBeRequired();

  await user.type(emailInput, signupValues.email);
  await user.type(contactPersonPhoneInput, signupValues.phoneNumber);
  await user.click(submitButton);
  await waitFor(() => expect(serviceLanguageButton).toHaveFocus());

  await user.click(serviceLanguageButton);
  const serviceLanguageOption = await screen.findByRole('option', {
    name: /suomi/i,
  });
  await user.click(serviceLanguageOption);
  await user.click(submitButton);
  await waitFor(() => expect(acceptCheckbox).toHaveFocus());

  await user.click(acceptCheckbox);
  await user.click(submitButton);
  await waitFor(() =>
    expect(mockRouter.asPath).toBe(
      `/fi/registration/${registration.id}/signup-group/create/summary`
    )
  );
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

  pushCreateSignupGroupRoute(TEST_REGISTRATION_ID);
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

  pushCreateSignupGroupRoute('not-found');
  renderComponent();

  await loadingSpinnerIsNotInDocument();

  await screen.findByRole('heading', {
    name: 'Valitettavasti etsimääsi sivua ei löydy',
  });

  screen.getByText(
    'Hakemaasi sivua ei löytynyt. Yritä myöhemmin uudelleen. Jos ongelma jatkuu, ota meihin yhteyttä.'
  );
});

test('should add and delete participants', async () => {
  const user = userEvent.setup();

  setQueryMocks(
    ...defaultMocks,
    rest.post(`*/seats_reservation/`, (req, res, ctx) =>
      res(ctx.status(201), ctx.json({ ...seatsReservation, seats }))
    ),
    rest.put(`*/seats_reservation/${seatsReservation.id}/`, (req, res, ctx) =>
      res(ctx.status(200), ctx.json({ ...seatsReservation, seats }))
    )
  );
  pushCreateSignupGroupRoute(TEST_REGISTRATION_ID);
  renderComponent();

  await loadingSpinnerIsNotInDocument();

  const participantAmountInput = getSignupFormElement('participantAmountInput');
  const updateParticipantAmountButton = getSignupFormElement(
    'updateParticipantAmountButton'
  );

  expect(
    screen.queryByRole('button', { name: 'Osallistuja 2' })
  ).not.toBeInTheDocument();

  await user.clear(participantAmountInput);
  await user.type(participantAmountInput, '2');
  seats = 2;
  await user.click(updateParticipantAmountButton);

  await screen.findByRole('button', { name: 'Osallistuja 2' });

  await user.clear(participantAmountInput);
  await user.type(participantAmountInput, '1');
  seats = 1;
  await user.click(updateParticipantAmountButton);

  const dialog = screen.getByRole('dialog', {
    name: 'Vahvista osallistujan poistaminen',
  });
  const deleteParticipantButton = within(dialog).getByRole('button', {
    name: 'Poista osallistuja',
  });
  await user.click(deleteParticipantButton);

  await actWait(10);
  await waitFor(() =>
    expect(
      screen.queryByRole('button', { name: 'Osallistuja 2' })
    ).not.toBeInTheDocument()
  );
});

test('should show server errors when updating seats reservation fails', async () => {
  const user = userEvent.setup();
  setQueryMocks(
    ...defaultMocks,
    rest.post(`*/seats_reservation/`, (req, res, ctx) =>
      res(ctx.status(201), ctx.json({ ...seatsReservation, seats }))
    ),
    rest.put(`*/seats_reservation/${seatsReservation.id}/`, (req, res, ctx) =>
      seats === 2
        ? res(
            ctx.status(400),
            ctx.json('Not enough seats available. Capacity left: 0.')
          )
        : res(ctx.status(200), ctx.json({ ...seatsReservation, seats }))
    )
  );
  pushCreateSignupGroupRoute(TEST_REGISTRATION_ID);
  renderComponent();

  await loadingSpinnerIsNotInDocument();

  const participantAmountInput = getSignupFormElement('participantAmountInput');
  const updateParticipantAmountButton = getSignupFormElement(
    'updateParticipantAmountButton'
  );

  expect(
    screen.queryByRole('button', { name: 'Osallistuja 2' })
  ).not.toBeInTheDocument();

  await user.clear(participantAmountInput);
  await user.type(participantAmountInput, '2');
  seats = 2;
  await user.click(updateParticipantAmountButton);

  await screen.findByText(
    'Paikkoja ei ole riittävästi jäljellä. Paikkoja jäljellä: 0.'
  );
});

test('should show and hide participant specific fields', async () => {
  const user = userEvent.setup();

  setQueryMocks(
    ...defaultMocks,
    rest.post(`*/seats_reservation/`, (req, res, ctx) =>
      res(ctx.status(201), ctx.json({ ...seatsReservation, seats }))
    ),
    rest.put(`*/seats_reservation/${seatsReservation.id}/`, (req, res, ctx) =>
      res(ctx.status(200), ctx.json({ ...seatsReservation, seats }))
    )
  );
  pushCreateSignupGroupRoute(TEST_REGISTRATION_ID);
  renderComponent();

  await loadingSpinnerIsNotInDocument();

  const firstNameInput = getSignupFormElement('firstNameInput');
  const toggleButton = screen.getByRole('button', { name: 'Osallistuja 1' });

  await user.click(toggleButton);
  expect(firstNameInput).not.toBeInTheDocument();

  await user.click(toggleButton);
  getSignupFormElement('firstNameInput');
});

test('should delete participants by clicking delete participant button', async () => {
  const user = userEvent.setup();

  setQueryMocks(
    ...defaultMocks,
    rest.post(`*/seats_reservation/`, (req, res, ctx) =>
      res(ctx.status(201), ctx.json({ ...seatsReservation, seats }))
    ),
    rest.put(`*/seats_reservation/${seatsReservation.id}/`, (req, res, ctx) =>
      res(ctx.status(200), ctx.json({ ...seatsReservation, seats }))
    )
  );
  pushCreateSignupGroupRoute(TEST_REGISTRATION_ID);
  renderComponent();

  await loadingSpinnerIsNotInDocument();

  const participantAmountInput = getSignupFormElement('participantAmountInput');
  const updateParticipantAmountButton = getSignupFormElement(
    'updateParticipantAmountButton'
  );

  expect(
    screen.queryByRole('button', { name: 'Osallistuja 2' })
  ).not.toBeInTheDocument();

  await user.clear(participantAmountInput);
  await user.type(participantAmountInput, '2');
  seats = 2;
  await user.click(updateParticipantAmountButton);

  await screen.findByRole('button', { name: 'Osallistuja 2' });

  const deleteButton = screen.getAllByRole('button', {
    name: /poista osallistuja/i,
  })[1];
  await user.click(deleteButton);

  const dialog = screen.getByRole('dialog', {
    name: 'Vahvista osallistujan poistaminen',
  });
  const deleteParticipantButton = within(dialog).getByRole('button', {
    name: 'Poista osallistuja',
  });
  seats = 1;
  await user.click(deleteParticipantButton);

  await actWait(10);
  await waitFor(() =>
    expect(
      screen.queryByRole('button', { name: 'Osallistuja 2' })
    ).not.toBeInTheDocument()
  );
  expect(participantAmountInput).toHaveValue(1);
});

test('should show server errors when updating seats reservation fails', async () => {
  const user = userEvent.setup();

  setQueryMocks(
    ...defaultMocks,
    rest.post(`*/seats_reservation/`, (req, res, ctx) =>
      res(ctx.status(201), ctx.json({ ...seatsReservation, seats }))
    ),
    rest.put(`*/seats_reservation/${seatsReservation.id}/`, (req, res, ctx) =>
      seats === 2
        ? res(
            ctx.status(400),
            ctx.json('Not enough seats available. Capacity left: 0.')
          )
        : res(ctx.status(200), ctx.json({ ...seatsReservation, seats }))
    )
  );
  pushCreateSignupGroupRoute(TEST_REGISTRATION_ID);
  renderComponent();

  await loadingSpinnerIsNotInDocument();

  const participantAmountInput = getSignupFormElement('participantAmountInput');
  const updateParticipantAmountButton = getSignupFormElement(
    'updateParticipantAmountButton'
  );

  expect(
    screen.queryByRole('button', { name: 'Osallistuja 3' })
  ).not.toBeInTheDocument();

  await user.clear(participantAmountInput);
  await user.type(participantAmountInput, '3');
  seats = 3;
  await user.click(updateParticipantAmountButton);

  await screen.findByRole('button', { name: 'Osallistuja 3' });

  const deleteButton = screen.getAllByRole('button', {
    name: /poista osallistuja/i,
  })[1];
  await user.click(deleteButton);

  const dialog = screen.getByRole('dialog', {
    name: 'Vahvista osallistujan poistaminen',
  });
  const deleteParticipantButton = within(dialog).getByRole('button', {
    name: 'Poista osallistuja',
  });
  seats = 2;
  await user.click(deleteParticipantButton);

  await screen.findByText(
    'Paikkoja ei ole riittävästi jäljellä. Paikkoja jäljellä: 0.'
  );
});

test('should reload page if reservation is expired and route is create signup group page', async () => {
  mockRouter.reload = jest.fn();
  const user = userEvent.setup();

  setQueryMocks(...defaultMocks);
  setSignupGroupFormSessionStorageValues({
    registrationId: registration.id,
    seatsReservation: getMockedSeatsReservationData(-1000),
  });
  pushCreateSignupGroupRoute(TEST_REGISTRATION_ID);
  renderComponent();

  const modal = await screen.findByRole(
    'dialog',
    { name: 'Varausaika on täynnä.' },
    { timeout: 5000 }
  );
  const tryAgainButton = within(modal).getByRole('button', {
    name: 'Yritä uudelleen',
  });

  user.click(tryAgainButton);
  await waitFor(() => expect(mockRouter.reload).toBeCalled());
});

test('should show authentication required notification', async () => {
  setQueryMocks(...defaultMocks);
  pushCreateSignupGroupRoute(registration.id);
  renderComponent(null);

  await loadingSpinnerIsNotInDocument();

  await screen.findByRole('heading', { name: 'Kirjaudu sisään' });
  screen.getByText(
    'Sinun täytyy kirjautua sisään ilmoittautuaksesi tähän tapahtumaan.'
  );
});
