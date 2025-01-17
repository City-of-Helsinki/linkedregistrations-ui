/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { rest } from 'msw';
import singletonRouter from 'next/router';
import * as nextAuth from 'next-auth/react';
import mockRouter from 'next-router-mock';
import React from 'react';

import { ExtendedSession } from '../../../types';
import { fakeSignups } from '../../../utils/mockDataUtils';
import { fakeAuthenticatedSession } from '../../../utils/mockSession';
import {
  configure,
  loadingSpinnerIsNotInDocument,
  render,
  setQueryMocks,
  userEvent,
  waitFor,
  within,
} from '../../../utils/testUtils';
import { ROUTES } from '../../app/routes/constants';
import {
  mockedRegistrationWithUserAccessResponse,
  mockedRegistrationWithoutUserAccessResponse,
  registration,
  registrationId,
} from '../../attendanceList/__mocks__/attendanceListPage';
import { mockedUserResponse, user } from '../../user/__mocks__/user';
import { TEST_USER_ID } from '../../user/constants';
import {
  openSignupsPageMenu,
  shouldExportSignupsAsExcel,
} from '../__mocks__/testUtils';
import SignupsPage from '../SignupsPage';
import {
  shouldShowInsufficientPermissionsPage,
  shouldShowNotFoundPage,
  shouldShowSigninRequiredPage,
  shouldShowStrongIdentificationRequiredPage,
} from '../signupsTestUtils';

configure({ defaultHidden: true });

jest.mock('next/dist/client/router', () => require('next-router-mock'));

const defaultSession = fakeAuthenticatedSession();

// Mock getSession return value
(nextAuth as any).getSession = jest.fn().mockReturnValue(defaultSession);

const defaultMocks = [
  rest.get(`*/signup/`, (req, res, ctx) =>
    res(ctx.status(200), ctx.json(fakeSignups(0)))
  ),
  mockedUserResponse,
  mockedRegistrationWithUserAccessResponse,
];

const pushSignupsRoute = () => {
  singletonRouter.push({
    pathname: ROUTES.SIGNUPS,
    query: { registrationId: registrationId },
  });
};

const renderComponent = (session: ExtendedSession | null = defaultSession) =>
  render(<SignupsPage />, { session });

// Tests

test('should show authentication required page if user is not authenticated', async () => {
  setQueryMocks(...defaultMocks);
  pushSignupsRoute();
  renderComponent(null);

  await loadingSpinnerIsNotInDocument();
  await shouldShowSigninRequiredPage();
});

test('should show strong identification required page if user is not strongly identificated', async () => {
  const userRequestMock = rest.get(`*/user/${TEST_USER_ID}/`, (req, res, ctx) =>
    res(ctx.status(200), ctx.json({ ...user, is_strongly_identified: false }))
  );
  setQueryMocks(...[userRequestMock, mockedRegistrationWithUserAccessResponse]);
  pushSignupsRoute();
  renderComponent();

  await loadingSpinnerIsNotInDocument();
  await shouldShowStrongIdentificationRequiredPage();
});

test('should show insufficient permissions page if has_registration_user_access is false', async () => {
  setQueryMocks(
    ...[mockedUserResponse, mockedRegistrationWithoutUserAccessResponse]
  );
  pushSignupsRoute();
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
  pushSignupsRoute();
  renderComponent();

  await loadingSpinnerIsNotInDocument();
  await shouldShowNotFoundPage();
});

test('should route to signups page when clicking view attendance list button', async () => {
  const user = userEvent.setup();

  setQueryMocks(...defaultMocks);
  pushSignupsRoute();
  renderComponent();

  await loadingSpinnerIsNotInDocument(10000);
  const { menu } = await openSignupsPageMenu();

  const viewAttendanceListButton = await within(menu).findByRole('button', {
    name: 'Merkkaa läsnäolijat',
  });

  await user.click(viewAttendanceListButton);

  await waitFor(() =>
    expect(mockRouter.asPath).toBe(
      '/registration/registration:1/attendance-list'
    )
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
  pushSignupsRoute();
  renderComponent();
  await shouldExportSignupsAsExcel(registration);
});
