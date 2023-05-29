/* eslint-disable @typescript-eslint/no-require-imports */
import subYears from 'date-fns/subYears';
import { axe } from 'jest-axe';
import { rest } from 'msw';
import mockRouter from 'next-router-mock';
import singletonRouter from 'next/router';
import React from 'react';

import formatDate from '../../../utils/formatDate';
import {
  fakeSeatsReservation,
  getMockedSeatsReservationData,
  setEnrolmentFormSessionStorageValues,
} from '../../../utils/mockDataUtils';
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
import { languagesResponse } from '../../language/__mocks__/languages';
import { registration } from '../../registration/__mocks__/registration';
import { TEST_REGISTRATION_ID } from '../../registration/constants';
import CreateEnrolmentPage from '../CreateEnrolmentPage';

configure({ defaultHidden: true });

jest.mock('next/dist/client/router', () => require('next-router-mock'));

const enrolmentValues = {
  city: 'City',
  dateOfBirth: formatDate(subYears(new Date(), 9)),
  email: 'participant@email.com',
  name: 'Participan name',
  phoneNumber: '+358 44 123 4567',
  streetAddress: 'Street address',
  zip: '00100',
};

let seats = 1;
const seatsReservation = fakeSeatsReservation();

const findElement = (key: 'nameInput') => {
  switch (key) {
    case 'nameInput':
      return screen.findByRole('textbox', { name: /nimi/i });
  }
};

const getElement = (
  key:
    | 'acceptCheckbox'
    | 'cityInput'
    | 'dateOfBirthInput'
    | 'emailCheckbox'
    | 'emailInput'
    | 'nameInput'
    | 'nativeLanguageButton'
    | 'participantAmountInput'
    | 'phoneCheckbox'
    | 'phoneInput'
    | 'serviceLanguageButton'
    | 'streetAddressInput'
    | 'submitButton'
    | 'updateParticipantAmountButton'
    | 'zipInput'
) => {
  switch (key) {
    case 'acceptCheckbox':
      return screen.getByLabelText(
        /hyväksyn tietojeni jakamisen järjestäjän kanssa/i
      );
    case 'cityInput':
      return screen.getByLabelText(/kaupunki/i);
    case 'dateOfBirthInput':
      return screen.getByLabelText(/syntymäaika/i);
    case 'emailCheckbox':
      return screen.getByLabelText(/sähköpostilla/i);
    case 'emailInput':
      return screen.getByLabelText(/sähköpostiosoite/i);
    case 'nameInput':
      return screen.getByLabelText(/nimi/i);
    case 'nativeLanguageButton':
      return screen.getByRole('button', { name: /äidinkieli/i });
    case 'participantAmountInput':
      return screen.getByRole('spinbutton', {
        name: /ilmoittautujien määrä \*/i,
      });
    case 'phoneCheckbox':
      return screen.getByLabelText(/tekstiviestillä/i);
    case 'phoneInput':
      return screen.getByLabelText(/puhelinnumero/i);
    case 'serviceLanguageButton':
      return screen.getByRole('button', { name: /asiointikieli/i });
    case 'streetAddressInput':
      return screen.getByLabelText(/katuosoite/i);
    case 'submitButton':
      return screen.getByRole('button', { name: /jatka ilmoittautumiseen/i });
    case 'updateParticipantAmountButton':
      return screen.getByRole('button', { name: /päivitä/i });
    case 'zipInput':
      return screen.getByLabelText(/postinumero/i);
  }
};

const renderComponent = () => render(<CreateEnrolmentPage />);

beforeEach(() => {
  seats = 1;
  // values stored in tests will also be available in other tests unless you run
  localStorage.clear();
  sessionStorage.clear();
});

const defaultMocks = [
  rest.get('*/language/', (req, res, ctx) =>
    res(ctx.status(200), ctx.json(languagesResponse))
  ),
  rest.get(`*/registration/${TEST_REGISTRATION_ID}/`, (req, res, ctx) =>
    res(ctx.status(200), ctx.json(registration))
  ),
];

test.skip('page is accessible', async () => {
  setQueryMocks(...defaultMocks);
  singletonRouter.push({
    pathname: ROUTES.CREATE_ENROLMENT,
    query: { registrationId: TEST_REGISTRATION_ID },
  });
  const { container } = renderComponent();

  await findElement('nameInput');
  expect(await axe(container)).toHaveNoViolations();
});

test('should validate enrolment form and focus invalid field', async () => {
  const user = userEvent.setup();

  setQueryMocks(
    ...defaultMocks,
    rest.post(`*/seats_reservation/`, (req, res, ctx) =>
      res(ctx.status(201), ctx.json({ ...seatsReservation, seats }))
    )
  );
  singletonRouter.push({
    pathname: ROUTES.CREATE_ENROLMENT,
    query: { registrationId: TEST_REGISTRATION_ID },
  });
  renderComponent();

  const nameInput = await findElement('nameInput');
  const dateOfBirthInput = getElement('dateOfBirthInput');
  const emailInput = getElement('emailInput');
  const phoneInput = getElement('phoneInput');
  const emailCheckbox = getElement('emailCheckbox');
  const phoneCheckbox = getElement('phoneCheckbox');
  const nativeLanguageButton = getElement('nativeLanguageButton');
  const serviceLanguageButton = getElement('serviceLanguageButton');
  const acceptCheckbox = getElement('acceptCheckbox');
  const submitButton = getElement('submitButton');

  expect(nameInput).not.toHaveFocus();

  await user.click(submitButton);
  await waitFor(() => expect(nameInput).toHaveFocus());

  await user.type(nameInput, enrolmentValues.name);
  await user.click(submitButton);
  await waitFor(() => expect(dateOfBirthInput).toHaveFocus());

  await user.type(dateOfBirthInput, formatDate(subYears(new Date(), 15)));
  await user.click(submitButton);
  await waitFor(() => expect(emailInput).toHaveFocus());
  expect(emailInput).toBeRequired();
  expect(phoneInput).not.toBeRequired();

  await user.type(emailInput, enrolmentValues.email);
  await user.click(submitButton);
  await waitFor(() => expect(emailCheckbox).toHaveFocus());

  await user.click(emailCheckbox);
  await user.click(phoneCheckbox);
  await user.click(submitButton);
  await waitFor(() => expect(phoneInput).toHaveFocus());
  expect(phoneInput).toBeRequired();

  await user.type(phoneInput, enrolmentValues.phoneNumber);
  await user.click(submitButton);
  await waitFor(() => expect(nativeLanguageButton).toHaveFocus());

  await user.click(nativeLanguageButton);
  const nativeLanguageOption = await screen.findByRole('option', {
    name: /suomi/i,
  });
  await user.click(nativeLanguageOption);
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
      `/fi/registration/${registration.id}/enrolment/create/summary`
    )
  );
});

test('should show not found page if registration does not exist', async () => {
  setQueryMocks(
    rest.get(`*/registration/not-found/`, (req, res, ctx) =>
      res(ctx.status(404), ctx.json({ errorMessage: 'Not found' }))
    )
  );

  singletonRouter.push({
    pathname: ROUTES.CREATE_ENROLMENT,
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
  singletonRouter.push({
    pathname: ROUTES.CREATE_ENROLMENT,
    query: { registrationId: TEST_REGISTRATION_ID },
  });
  renderComponent();

  await loadingSpinnerIsNotInDocument();

  const participantAmountInput = getElement('participantAmountInput');
  const updateParticipantAmountButton = getElement(
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
  singletonRouter.push({
    pathname: ROUTES.CREATE_ENROLMENT,
    query: { registrationId: TEST_REGISTRATION_ID },
  });
  renderComponent();

  await loadingSpinnerIsNotInDocument();

  const participantAmountInput = getElement('participantAmountInput');
  const updateParticipantAmountButton = getElement(
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
  singletonRouter.push({
    pathname: ROUTES.CREATE_ENROLMENT,
    query: { registrationId: TEST_REGISTRATION_ID },
  });
  renderComponent();

  await loadingSpinnerIsNotInDocument();

  const nameInput = getElement('nameInput');
  const toggleButton = screen.getByRole('button', { name: 'Osallistuja 1' });

  await user.click(toggleButton);
  expect(nameInput).not.toBeInTheDocument();

  await user.click(toggleButton);
  getElement('nameInput');
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
  singletonRouter.push({
    pathname: ROUTES.CREATE_ENROLMENT,
    query: { registrationId: TEST_REGISTRATION_ID },
  });
  renderComponent();

  await loadingSpinnerIsNotInDocument();

  const participantAmountInput = getElement('participantAmountInput');
  const updateParticipantAmountButton = getElement(
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
  singletonRouter.push({
    pathname: ROUTES.CREATE_ENROLMENT,
    query: { registrationId: TEST_REGISTRATION_ID },
  });
  renderComponent();

  await loadingSpinnerIsNotInDocument();

  const participantAmountInput = getElement('participantAmountInput');
  const updateParticipantAmountButton = getElement(
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

test('should reload page if reservation is expired and route is create enrolment page', async () => {
  mockRouter.reload = jest.fn();
  const user = userEvent.setup();

  setQueryMocks(...defaultMocks);
  setEnrolmentFormSessionStorageValues({
    registrationId: registration.id,
    seatsReservation: getMockedSeatsReservationData(-1000),
  });
  singletonRouter.push({
    pathname: ROUTES.CREATE_ENROLMENT,
    query: { registrationId: registration.id },
  });

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
