/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { axe } from 'jest-axe';
import { rest } from 'msw';
import mockRouter from 'next-router-mock';
import singletonRouter from 'next/router';
import React from 'react';

import {
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
import { event } from '../../event/__mocks__/event';
import { TEST_EVENT_ID } from '../../event/constants';
import { languagesResponse } from '../../language/__mocks__/languages';
import { place } from '../../place/__mocks__/place';
import { TEST_PLACE_ID } from '../../place/constants';
import { registration } from '../../registration/__mocks__/registration';
import { TEST_REGISTRATION_ID } from '../../registration/constants';
import { enrolment } from '../__mocks__/enrolment';
import { TEST_ENROLMENT_CANCELLATION_CODE } from '../constants';
import EditEnrolmentPage from '../EditEnrolmentPage';

configure({ defaultHidden: true });

jest.mock('next/dist/client/router', () => require('next-router-mock'));

const findElement = (key: 'nameInput') => {
  switch (key) {
    case 'nameInput':
      return screen.findByRole('textbox', { name: /nimi/i });
  }
};

const getElement = (
  key:
    | 'cancelButton'
    | 'cityInput'
    | 'dateOfBirthInput'
    | 'emailCheckbox'
    | 'emailInput'
    | 'nameInput'
    | 'nativeLanguageButton'
    | 'phoneCheckbox'
    | 'phoneInput'
    | 'serviceLanguageButton'
    | 'streetAddressInput'
    | 'zipInput'
) => {
  switch (key) {
    case 'cancelButton':
      return screen.getByRole('button', { name: /peruuta ilmoittautuminen/i });
    case 'cityInput':
      return screen.getByRole('textbox', { name: /kaupunki/i });
    case 'dateOfBirthInput':
      return screen.getByRole('textbox', { name: /syntymäaika/i });
    case 'emailCheckbox':
      return screen.getByRole('checkbox', { name: /sähköpostilla/i });
    case 'emailInput':
      return screen.getByRole('textbox', { name: /sähköpostiosoite/i });
    case 'nameInput':
      return screen.getByRole('textbox', { name: /nimi/i });
    case 'nativeLanguageButton':
      return screen.getByRole('button', { name: /äidinkieli/i });
    case 'phoneCheckbox':
      return screen.getByRole('checkbox', { name: /tekstiviestillä/i });
    case 'phoneInput':
      return screen.getByRole('textbox', { name: /puhelinnumero/i });
    case 'serviceLanguageButton':
      return screen.getByRole('button', { name: /asiointikieli/i });
    case 'streetAddressInput':
      return screen.getByRole('textbox', { name: /katuosoite/i });
    case 'zipInput':
      return screen.getByRole('textbox', { name: /postinumero/i });
  }
};

const renderComponent = () => render(<EditEnrolmentPage />);

test.skip('page is accessible', async () => {
  const { container } = renderComponent();

  await findElement('nameInput');
  expect(await axe(container)).toHaveNoViolations();
});

const defaultMocks = [
  rest.get(`*/event/${TEST_EVENT_ID}/`, (req, res, ctx) =>
    res(ctx.status(200), ctx.json(event))
  ),
  rest.get(`*/place/${TEST_PLACE_ID}/`, (req, res, ctx) =>
    res(ctx.status(200), ctx.json(place))
  ),
  rest.get('*/language/', (req, res, ctx) =>
    res(ctx.status(200), ctx.json(languagesResponse))
  ),
  rest.get(`*/registration/${TEST_REGISTRATION_ID}/`, (req, res, ctx) =>
    res(ctx.status(200), ctx.json(registration))
  ),
  rest.get(`*/signup/*`, (req, res, ctx) =>
    res(ctx.status(200), ctx.json(enrolment))
  ),
];

test('should edit enrolment page field', async () => {
  setQueryMocks(...defaultMocks);
  singletonRouter.push({
    pathname: ROUTES.EDIT_ENROLMENT,
    query: {
      accessCode: TEST_ENROLMENT_CANCELLATION_CODE,
      registrationId: TEST_REGISTRATION_ID,
    },
  });
  renderComponent();

  const nameInput = await findElement('nameInput');
  const streetAddressInput = getElement('streetAddressInput');
  const dateOfBirthInput = getElement('dateOfBirthInput');
  const zipInput = getElement('zipInput');
  const cityInput = getElement('cityInput');
  const emailInput = getElement('emailInput');
  const phoneInput = getElement('phoneInput');
  const emailCheckbox = getElement('emailCheckbox');
  const phoneCheckbox = getElement('phoneCheckbox');
  const nativeLanguageButton = getElement('nativeLanguageButton');
  const serviceLanguageButton = getElement('serviceLanguageButton');
  getElement('cancelButton');

  expect(nameInput.hasAttribute('readonly')).toBeTruthy();
  expect(streetAddressInput.hasAttribute('readonly')).toBeTruthy();
  expect(dateOfBirthInput.hasAttribute('readonly')).toBeTruthy();
  expect(zipInput.hasAttribute('readonly')).toBeTruthy();
  expect(cityInput.hasAttribute('readonly')).toBeTruthy();
  expect(emailInput.hasAttribute('readonly')).toBeTruthy();
  expect(phoneInput.hasAttribute('readonly')).toBeTruthy();
  expect(emailCheckbox).toBeDisabled();
  expect(phoneCheckbox).toBeDisabled();
  expect(nativeLanguageButton).toBeDisabled();
  expect(serviceLanguageButton).toBeDisabled();
});

test('should cancel enrolment', async () => {
  const user = userEvent.setup();

  setQueryMocks(
    ...defaultMocks,
    rest.delete(`*/signup/`, (req, res, ctx) =>
      res(ctx.status(201), ctx.json(null))
    )
  );
  singletonRouter.push({
    pathname: ROUTES.EDIT_ENROLMENT,
    query: {
      accessCode: TEST_ENROLMENT_CANCELLATION_CODE,
      registrationId: TEST_REGISTRATION_ID,
    },
  });
  renderComponent();

  await findElement('nameInput');

  const cancelButton = getElement('cancelButton');
  await user.click(cancelButton);
  const modal = await screen.findByRole('dialog', {
    name: 'Haluatko varmasti poistaa ilmoittautumisen?',
  });
  const withinModal = within(modal);
  const cancelEnrolmentButton = withinModal.getByRole('button', {
    name: 'Peruuta ilmoittautuminen',
  });
  await user.click(cancelEnrolmentButton);

  await waitFor(() =>
    expect(mockRouter.asPath).toBe(
      `/fi/registration/${TEST_REGISTRATION_ID}/enrolment/cancelled`
    )
  );
});

test('should show error message when cancelling enrolment fails', async () => {
  const user = userEvent.setup();

  setQueryMocks(
    ...defaultMocks,
    rest.delete(`*/signup/`, (req, res, ctx) =>
      res(ctx.status(403), ctx.json({ detail: 'Malformed UUID.' }))
    )
  );
  singletonRouter.push({
    pathname: ROUTES.EDIT_ENROLMENT,
    query: {
      accessCode: TEST_ENROLMENT_CANCELLATION_CODE,
      registrationId: TEST_REGISTRATION_ID,
    },
  });
  renderComponent();

  await findElement('nameInput');

  const cancelButton = getElement('cancelButton');
  await user.click(cancelButton);
  const modal = await screen.findByRole('dialog', {
    name: 'Haluatko varmasti poistaa ilmoittautumisen?',
  });
  const withinModal = within(modal);
  const cancelEnrolmentButton = withinModal.getByRole('button', {
    name: 'Peruuta ilmoittautuminen',
  });
  await user.click(cancelEnrolmentButton);

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
      res(ctx.status(200), ctx.json(enrolment))
    )
  );

  singletonRouter.push({
    pathname: ROUTES.EDIT_ENROLMENT,
    query: {
      accessCode: TEST_ENROLMENT_CANCELLATION_CODE,
      registrationId: 'not-found',
    },
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
