/* eslint-disable @typescript-eslint/ban-ts-comment */
import { rest } from 'msw';
import mockRouter from 'next-router-mock';
import React from 'react';

import {
  fakeRegistration,
  fakeSignup,
  fakeSignupGroup,
} from '../../../utils/mockDataUtils';
import {
  render,
  screen,
  setQueryMocks,
  waitFor,
} from '../../../utils/testUtils';
import { event, eventOverrides } from '../../event/__mocks__/event';
import { TEST_REGISTRATION_ID } from '../../registration/constants';
import { ATTENDEE_STATUS, SIGNUP_QUERY_PARAMS } from '../../signup/constants';
import { signupGroup } from '../__mocks__/signupGroup';
import { TEST_SIGNUP_GROUP_ID } from '../constants';
import SignupGroupCompletedPage from '../SignupGroupCompletedPage';

const renderComponent = (query?: {
  [SIGNUP_QUERY_PARAMS.REDIRECT_URL]: string;
}) => {
  mockRouter.setCurrentUrl({
    pathname: '/',
    query: {
      registrationId: TEST_REGISTRATION_ID,
      ...query,
    },
  });
  return render(<SignupGroupCompletedPage />);
};

const registrationWithoutConfirmationMessage = fakeRegistration({
  id: TEST_REGISTRATION_ID,
  event,
  confirmation_message: null,
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
  confirmation_message: { fi: confirmationMessage },
});
const mockedRegistrationWithConfirmationMessageResponse = rest.get(
  `*/registration/${TEST_REGISTRATION_ID}`,
  (req, res, ctx) =>
    res(ctx.status(200), ctx.json(registrationWithConfirmationMessage))
);

const mockedSignupGroupResponse = rest.get(
  `*/signup_group/*`,
  (req, res, ctx) => res(ctx.status(200), ctx.json(signupGroup))
);

const mockedSignupGroupInWaitingListResponse = rest.get(
  `*/signup_group/*`,
  (req, res, ctx) =>
    res(
      ctx.status(200),
      ctx.json(
        fakeSignupGroup({
          id: TEST_SIGNUP_GROUP_ID,
          signups: [
            fakeSignup({ attendee_status: ATTENDEE_STATUS.Waitlisted }),
          ],
        })
      )
    )
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

test('should show default signup completed text', async () => {
  setQueryMocks(
    mockedRegistrationWithoutConfirmationMessageResponse,
    mockedSignupGroupResponse
  );
  renderComponent();

  await screen.findByRole('heading', { name: 'Kiitos ilmoittautumisestasi!' });
  screen.getByText(
    `Olet ilmoittanut tapahtumaamme ${eventOverrides.name?.fi} – sydämellisesti tervetuloa!`
  );
  screen.getByRole('button', { name: 'Lisää kalenteriin' });
});

test('should show added to waiting list text', async () => {
  setQueryMocks(
    mockedRegistrationWithoutConfirmationMessageResponse,
    mockedSignupGroupInWaitingListResponse
  );
  renderComponent();

  await screen.findByRole('heading', { name: 'Kiitos ilmoittautumisestasi!' });
  screen.getByText(
    // eslint-disable-next-line max-len
    `Olet ilmoittautunut tapahtuman ${eventOverrides.name?.fi} jonoon. Mikäli sinulle vapautuu paikka, saat ilmoittautumisestasi erillisen vahvistusviestin sähköpostiisi.`
  );
});

test('should show custom confirmation message', async () => {
  setQueryMocks(
    mockedRegistrationWithConfirmationMessageResponse,
    mockedSignupGroupResponse
  );
  renderComponent();

  await screen.findByRole('heading', { name: 'Kiitos ilmoittautumisestasi!' });
  screen.getByText(confirmationMessage);
});

test('should automatically redirect user', async () => {
  const redirectUrl = 'https://www.google.com';
  setQueryMocks(
    mockedRegistrationWithoutConfirmationMessageResponse,
    mockedSignupGroupResponse
  );
  renderComponent({ redirect_url: redirectUrl });

  await waitFor(() => expect(window.location.href).toBe(redirectUrl), {
    timeout: 10000,
  });
});
