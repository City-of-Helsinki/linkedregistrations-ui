/* eslint-disable @typescript-eslint/ban-ts-comment */
import { rest } from 'msw';
import React from 'react';

import { fakeRegistration } from '../../../utils/mockDataUtils';
import {
  render,
  screen,
  setQueryMocks,
  waitFor,
} from '../../../utils/testUtils';
import { event, eventOverrides } from '../../event/__mocks__/event';
import { TEST_REGISTRATION_ID } from '../../registration/constants';
import { ENROLMENT_QUERY_PARAMS } from '../constants';
import EnrolmentCompletedPage from '../EnrolmentCompletedPage';

const renderComponent = (query?: {
  [ENROLMENT_QUERY_PARAMS.REDIRECT_URL]: string;
}) =>
  render(<EnrolmentCompletedPage />, {
    query: {
      registrationId: TEST_REGISTRATION_ID,
      ...query,
    },
  });

const registrationWithoutConfirmationMessage = fakeRegistration({
  id: TEST_REGISTRATION_ID,
  event,
  confirmation_message: '',
});
const mockedRegistrationWithoutConfirmationMessageResponse = rest.get(
  `*/registration/${TEST_REGISTRATION_ID}`,
  (req, res, ctx) =>
    res(ctx.status(200), ctx.json(registrationWithoutConfirmationMessage))
);

const confirmationMessage = 'Custom confirmation message';

const registrationWithConfirmationMessage = fakeRegistration({
  id: TEST_REGISTRATION_ID,
  event,
  confirmation_message: confirmationMessage,
});
const mockedRegistrationWithConfirmationMessageResponse = rest.get(
  `*/registration/${TEST_REGISTRATION_ID}`,
  (req, res, ctx) =>
    res(ctx.status(200), ctx.json(registrationWithConfirmationMessage))
);

const { location } = window;

beforeAll((): void => {
  // @ts-ignore
  delete window.location;
  // @ts-ignore
  window.location = { href: '' };
});

afterAll((): void => {
  window.location = location;
});

test('should show default enrolment completed text', async () => {
  setQueryMocks(mockedRegistrationWithoutConfirmationMessageResponse);
  renderComponent();

  await screen.findByRole('heading', { name: 'Kiitos ilmoittautumisestasi!' });
  screen.getByText(
    `Olet ilmoittanut tapahtumaamme ${eventOverrides.name.fi} – sydämellisesti tervetuloa!`
  );
});

test('should show custom confirmation message', async () => {
  setQueryMocks(mockedRegistrationWithConfirmationMessageResponse);
  renderComponent();

  await screen.findByRole('heading', { name: 'Kiitos ilmoittautumisestasi!' });
  screen.getByText(confirmationMessage);
});

test('should sutomatically redirect user', async () => {
  const redirectUrl = 'https://www.google.com';
  setQueryMocks(mockedRegistrationWithoutConfirmationMessageResponse);
  renderComponent({ redirect_url: redirectUrl });

  await waitFor(() => expect(window.location.href).toBe(redirectUrl), {
    timeout: 10000,
  });
});
