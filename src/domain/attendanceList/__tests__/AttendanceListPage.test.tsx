/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { rest } from 'msw';
import singletonRouter from 'next/router';
import * as nextAuth from 'next-auth/react';
import mockRouter from 'next-router-mock';
import React from 'react';

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
  within,
} from '../../../utils/testUtils';
import { ROUTES } from '../../app/routes/constants';
import { PRESENCE_STATUS } from '../../signup/constants';
import {
  getSignupsPageElement,
  openSignupsPageMenu,
  shouldExportSignupsAsExcel,
} from '../../singups/__mocks__/testUtils';
import {
  shouldShowInsufficientPermissionsPage,
  shouldShowNotFoundPage,
  shouldShowSigninRequiredPage,
  shouldShowStrongIdentificationRequiredPage,
} from '../../singups/signupsTestUtils';
import { mockedUserResponse, user } from '../../user/__mocks__/user';
import { TEST_USER_ID } from '../../user/constants';
import {
  mockedRegistrationWithoutUserAccessResponse,
  mockedRegistrationWithUserAccessResponse,
  patchedSignup,
  registration,
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

  const searchInput = getSignupsPageElement('searchInput');
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

  const searchInput = getSignupsPageElement('searchInput');
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
  await screen.findByRole('alert', {
    name: 'Läsnäolotiedon päivittäminen epäonnistui',
  });
});

test('should show authentication required page if user is not authenticated', async () => {
  setQueryMocks(...defaultMocks);
  pushAttendanceListRoute();
  renderComponent(null);

  await loadingSpinnerIsNotInDocument();
  await shouldShowSigninRequiredPage();
});

test('should show strong identification required page if user is not strongly identificated', async () => {
  const userRequestMock = rest.get(`*/user/${TEST_USER_ID}/`, (req, res, ctx) =>
    res(ctx.status(200), ctx.json({ ...user, is_strongly_identified: false }))
  );
  setQueryMocks(...[userRequestMock, mockedRegistrationWithUserAccessResponse]);
  pushAttendanceListRoute();
  renderComponent();

  await loadingSpinnerIsNotInDocument();
  await shouldShowStrongIdentificationRequiredPage();
});

test('should show insufficient permissions page if has_registration_user_access is false', async () => {
  setQueryMocks(
    ...[mockedUserResponse, mockedRegistrationWithoutUserAccessResponse]
  );
  pushAttendanceListRoute();
  renderComponent();

  await loadingSpinnerIsNotInDocument();
  await shouldShowInsufficientPermissionsPage();
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

test('should route to signups page when clicking view participants button', async () => {
  const user = userEvent.setup();

  setQueryMocks(...defaultMocks);
  pushAttendanceListRoute();
  renderComponent();

  await loadingSpinnerIsNotInDocument(10000);
  const { menu } = await openSignupsPageMenu();

  const viewParticipantsButton = await within(menu).findByRole('button', {
    name: 'Näytä ilmoittautuneet',
  });

  await user.click(viewParticipantsButton);

  await waitFor(() =>
    expect(mockRouter.asPath).toBe('/registration/registration:1/signup')
  );
});

test('should export signups as an excel after clicking export as excel button', async () => {
  setQueryMocks(
    ...defaultMocks,
    rest.get(
      `*registration/${registrationId}/signups/export/xlsx/`,
      (req, res, ctx) => res(ctx.status(200), ctx.json({}))
    )
  );
  pushAttendanceListRoute();
  renderComponent();
  await shouldExportSignupsAsExcel(registration);
});
