/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */
import { rest } from 'msw';
import singletonRouter from 'next/router';
import * as nextAuth from 'next-auth/react';
import React from 'react';
import { toast } from 'react-toastify';

import { ExtendedSession } from '../../../types';
import { fakeAuthenticatedSession } from '../../../utils/mockSession';
import {
  configure,
  loadingSpinnerIsNotInDocument,
  render,
  screen,
  setQueryMocks,
  userEvent,
  waitFor,
} from '../../../utils/testUtils';
import { ROUTES } from '../../app/routes/constants';
import { PRESENCE_STATUS } from '../../signup/constants';
import { mockedUserResponse } from '../../user/__mocks__/user';
import {
  mockedRegistrationWithUserAccessResponse,
  patchedSignup,
  registrationId,
  signupNames,
} from '../__mocks__/attendanceListPage';
import AttendanceListPage from '../AttendanceListPage';

configure({ defaultHidden: true });

const signUpName = `${signupNames[0].firstName} ${signupNames[0].lastName}`;

jest.mock('next/dist/client/router', () => require('next-router-mock'));

const defaultSession = fakeAuthenticatedSession();

// Mock getSession return value
(nextAuth as any).getSession = jest.fn().mockReturnValue(defaultSession);

const defaultMocks = [
  mockedUserResponse,
  mockedRegistrationWithUserAccessResponse,
];

const pushAttendanceListRoute = () => {
  singletonRouter.push({
    pathname: ROUTES.ATTENDANCE_LIST,
    query: { registrationId: registrationId },
  });
};

const renderComponent = (session: ExtendedSession | null = defaultSession) =>
  render(<AttendanceListPage />, { session });

const getSearchInput = () =>
  screen.getByRole('combobox', { name: 'Hae osallistujia' });

const shouldShowNotFoundPage = async () => {
  await screen.findByRole('heading', {
    name: 'Valitettavasti etsimääsi sivua ei löydy',
  });

  screen.getByText(
    'Hakemaasi sivua ei löytynyt. Yritä myöhemmin uudelleen. Jos ongelma jatkuu, ota meihin yhteyttä.'
  );
};

const shouldShowSigninRequiredPage = async () => {
  await screen.findByRole('heading', { name: 'Kirjautuminen vaaditaan' });

  screen.getByText(
    'Sinun tulee olla kirjautunut tarkastellaksesi ilmoittautumisen tietoja.'
  );
};

// Tests
test('should show attendance list page', async () => {
  setQueryMocks(...defaultMocks);
  pushAttendanceListRoute();
  renderComponent();
  await loadingSpinnerIsNotInDocument();

  for (const { firstName, lastName } of signupNames) {
    const name = `${firstName} ${lastName}`;
    screen.getByRole('checkbox', { name });
  }
});

test('should search attendees by name', async () => {
  const user = userEvent.setup();

  setQueryMocks(...defaultMocks);
  pushAttendanceListRoute();
  renderComponent();
  await loadingSpinnerIsNotInDocument();

  const searchInput = getSearchInput();
  await user.type(searchInput, signUpName);

  screen.getByRole('checkbox', { name: signUpName });
  for (const { firstName, lastName } of signupNames.slice(1)) {
    const name = `${firstName} ${lastName}`;
    expect(screen.queryByRole('checkbox', { name })).not.toBeInTheDocument();
  }
});

test('should show no results text', async () => {
  const user = userEvent.setup();

  setQueryMocks(...defaultMocks);
  pushAttendanceListRoute();
  renderComponent();
  await loadingSpinnerIsNotInDocument();

  const searchInput = getSearchInput();
  await user.type(searchInput, 'Name not found');

  await screen.findByText('Ei tuloksia');
});

test('should mark signup as present', async () => {
  const user = userEvent.setup();
  let presence_status = PRESENCE_STATUS.Present;
  setQueryMocks(
    ...defaultMocks,
    rest.patch(`*/signup/${patchedSignup.id}/`, (req, res, ctx) =>
      res(ctx.status(200), ctx.json({ ...patchedSignup, presence_status }))
    )
  );
  pushAttendanceListRoute();
  renderComponent();
  await loadingSpinnerIsNotInDocument();

  const signupCheckbox = screen.getByRole('checkbox', { name: signUpName });
  user.click(signupCheckbox);
  await waitFor(() => expect(signupCheckbox).toBeChecked());

  presence_status = PRESENCE_STATUS.NotPresent;
  user.click(signupCheckbox);
  await waitFor(() => expect(signupCheckbox).not.toBeChecked());
});

test('should show toast message if updating presence status fails', async () => {
  toast.error = jest.fn();
  const user = userEvent.setup();

  setQueryMocks(
    ...defaultMocks,
    rest.patch(`*/signup/${patchedSignup.id}/`, (req, res, ctx) =>
      res(
        ctx.status(404),
        ctx.json({ errorMessage: 'Failed to patch signup presence status' })
      )
    )
  );
  pushAttendanceListRoute();
  renderComponent();
  await loadingSpinnerIsNotInDocument();

  const signupCheckbox = screen.getByRole('checkbox', { name: signUpName });
  user.click(signupCheckbox);
  await waitFor(() =>
    expect(toast.error).toBeCalledWith(
      'Läsnäolotiedon päivittäminen epäonnistui'
    )
  );
});

test('should show authentication required page if user is not authenticated', async () => {
  setQueryMocks(...defaultMocks);
  pushAttendanceListRoute();
  renderComponent(null);

  await loadingSpinnerIsNotInDocument();
  await shouldShowSigninRequiredPage();
});

test('should show not found page if registration does not exist', async () => {
  setQueryMocks(
    mockedUserResponse,
    rest.get(`*/registration/${registrationId}/`, (req, res, ctx) =>
      res(ctx.status(404), ctx.json({ errorMessage: 'Not found' }))
    )
  );
  pushAttendanceListRoute();
  renderComponent();

  await loadingSpinnerIsNotInDocument();
  await shouldShowNotFoundPage();
});
