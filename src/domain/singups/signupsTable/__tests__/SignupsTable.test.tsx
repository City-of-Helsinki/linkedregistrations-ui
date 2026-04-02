/* eslint-disable @typescript-eslint/no-require-imports */
import { rest } from 'msw';
import singletonRouter from 'next/router';
import mockRouter from 'next-router-mock';
import React from 'react';

import { fakeSignups } from '../../../../utils/mockDataUtils';
import {
  configure,
  loadingSpinnerIsNotInDocument,
  render,
  screen,
  setQueryMocks,
  userEvent,
} from '../../../../utils/testUtils';
import { ROUTES } from '../../../app/routes/constants';
import { registration } from '../../../registration/__mocks__/registration';
import { TEST_REGISTRATION_ID } from '../../../registration/constants';
import { TEST_SIGNUP_GROUP_ID } from '../../../signupGroup/constants';
import {
  signupGroup,
  signupNames,
  signupNamesPage2,
  signups,
  signupsPage2,
  signupsWithGroup,
} from '../../__mocks__/signupsPage';
import SignupsTable, { SignupsTableProps } from '../SignupsTable';

configure({ defaultHidden: true });

vi.mock('next/dist/client/router', () => require('next-router-mock'));

const signupName = [signupNames[0].first_name, signupNames[0].last_name].join(
  ' '
);
const page2SignupName = [
  signupNamesPage2[0].first_name,
  signupNamesPage2[0].last_name,
].join(' ');

const defaultProps: SignupsTableProps = {
  caption: 'Signups table',
  registration: registration,
};

const pushSignupsRoute = () => {
  singletonRouter.push({
    pathname: ROUTES.SIGNUPS,
    query: { registrationId: TEST_REGISTRATION_ID },
  });
};

const renderComponent = () => {
  return render(<SignupsTable {...defaultProps} />);
};

test('should render signups table', async () => {
  setQueryMocks(
    rest.get(`*/signup/`, (req, res, ctx) =>
      res(ctx.status(200), ctx.json(fakeSignups(0)))
    )
  );
  renderComponent();

  screen.getByRole('table', { name: 'Signups table' });

  const columnHeaders = [
    'Nimi',
    'Puhelinnumero',
    'Yhteyshenkilön sähköposti',
    'Yhteyshenkilön puhelinnumero',
    'Status',
  ];

  for (const name of columnHeaders) {
    screen.getByRole('columnheader', { name });
  }
  await screen.findByText('Ei tuloksia');
});

test('should navigate between pages', async () => {
  const user = userEvent.setup();

  pushSignupsRoute();
  setQueryMocks(
    rest.get(`*/signup/`, (req, res, ctx) => {
      if (req.url.searchParams.get('page') === '2') {
        return res(ctx.status(200), ctx.json(signupsPage2));
      }
      return res(ctx.status(200), ctx.json(signups));
    })
  );

  renderComponent();

  await loadingSpinnerIsNotInDocument();

  // Page 1 signup should be visible.
  screen.getByText(signupName);
  const emailColumn = await screen.findByText(
    signups.data[0].contact_person?.email as string
  );
  const phoneColumn = await screen.findByText(
    signups.data[0].contact_person?.phone_number as string
  );
  expect(emailColumn).toBeInTheDocument();
  expect(phoneColumn).toBeInTheDocument();
  expect(screen.queryByText(page2SignupName)).not.toBeInTheDocument();

  const page2Button = screen.getByRole('link', { name: 'Sivu 2' });
  await user.click(page2Button);

  // Page 2 signup should be visible.
  await screen.findByText(page2SignupName);
  expect(screen.queryByText(signupName)).not.toBeInTheDocument();

  const page1Button = screen.getByRole('link', { name: 'Sivu 1' });
  await user.click(page1Button);

  // Page 1 signup should be visible.
  screen.getByText(signupName);
  expect(screen.queryByText(page2SignupName)).not.toBeInTheDocument();
});

test('should route to edit signup page when clicking signup name', async () => {
  pushSignupsRoute();
  setQueryMocks(
    rest.get(`*/signup/`, (req, res, ctx) =>
      res(ctx.status(200), ctx.json(signups))
    )
  );

  renderComponent();

  await loadingSpinnerIsNotInDocument();
  const signupLink = screen.getByRole('link', { name: signupName });
  expect(signupLink).toHaveAttribute(
    'href',
    `/registration/${encodeURIComponent(TEST_REGISTRATION_ID)}/signup/${
      signups.data[0].id
    }/edit?returnPath=${encodeURIComponent(mockRouter.asPath)}`
  );
});

test('should route to edit signup group page when clicking signup name and signup has a group', async () => {
  pushSignupsRoute();
  setQueryMocks(
    rest.get(`*/signup/`, (req, res, ctx) =>
      res(ctx.status(200), ctx.json(signupsWithGroup))
    ),
    rest.get(`*/signup_group/${TEST_SIGNUP_GROUP_ID}`, (req, res, ctx) =>
      res(ctx.status(200), ctx.json(signupGroup))
    )
  );

  renderComponent();

  await loadingSpinnerIsNotInDocument(5000);
  const signupLink = screen.getByRole('link', { name: signupName });
  const emailColumn = await screen.findByText(
    signupGroup.contact_person?.email as string
  );
  const phoneColumn = await screen.findByText(
    signupGroup.contact_person?.phone_number as string
  );
  expect(emailColumn).toBeInTheDocument();
  expect(phoneColumn).toBeInTheDocument();
  expect(signupLink).toHaveAttribute(
    'href',
    `/registration/${encodeURIComponent(
      TEST_REGISTRATION_ID
    )}/signup-group/${encodeURIComponent(
      TEST_SIGNUP_GROUP_ID
    )}/edit?returnPath=${encodeURIComponent(mockRouter.asPath)}`
  );
});
