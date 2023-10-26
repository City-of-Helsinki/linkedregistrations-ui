/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */
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
import {
  mockedRegistrationWithUserAccessResponse,
  mockedRegistrationWithoutUserAccessResponse,
  registrationId,
} from '../../attendanceList/__mocks__/attendanceListPage';
import { mockedUserResponse, user } from '../../user/__mocks__/user';
import { TEST_USER_ID } from '../../user/constants';
import SignupsPage from '../SignupsPage';
import {
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

const getElement = (key: 'menu' | 'searchInput' | 'toggle') => {
  switch (key) {
    case 'menu':
      return screen.getByRole('region', { name: /valinnat/i });
    case 'searchInput':
      return screen.getByRole('combobox', { name: 'Hae osallistujia' });
    case 'toggle':
      return screen.getByRole('button', { name: /valinnat/i });
  }
};

const openMenu = async () => {
  const user = userEvent.setup();
  const toggleButton = getElement('toggle');
  await user.click(toggleButton);
  const menu = getElement('menu');

  return { menu, toggleButton };
};

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

test('should show not found page if has_registration_user_access is false', async () => {
  setQueryMocks(
    ...[mockedUserResponse, mockedRegistrationWithoutUserAccessResponse]
  );
  pushSignupsRoute();
  renderComponent();

  await loadingSpinnerIsNotInDocument();
  await shouldShowNotFoundPage();
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
  const { menu } = await openMenu();

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
