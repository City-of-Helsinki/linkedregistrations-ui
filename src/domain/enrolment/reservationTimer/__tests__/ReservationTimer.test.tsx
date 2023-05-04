/* eslint-disable @typescript-eslint/no-require-imports */
import { rest } from 'msw';
import mockRouter from 'next-router-mock';
import singletonRouter from 'next/router';
import React from 'react';

import {
  fakeSeatsReservation,
  getMockedSeatsReservationData,
  setEnrolmentFormSessionStorageValues,
} from '../../../../utils/mockDataUtils';
import { fakeAuthenticatedSession } from '../../../../utils/mockSession';
import {
  render,
  screen,
  setQueryMocks,
  userEvent,
  waitFor,
  within,
} from '../../../../utils/testUtils';
import { ROUTES } from '../../../app/routes/constants';
import { registration } from '../../../registration/__mocks__/registration';
import { TEST_REGISTRATION_ID } from '../../../registration/constants';
import { EnrolmentPageProvider } from '../../enrolmentPageContext/EnrolmentPageContext';
import {
  EnrolmentServerErrorsContext,
  EnrolmentServerErrorsContextProps,
} from '../../enrolmentServerErrorsContext/EnrolmentServerErrorsContext';
import ReservationTimer from '../ReservationTimer';

jest.mock('next/dist/client/router', () => require('next-router-mock'));

const defaultServerErrorsProps: EnrolmentServerErrorsContextProps = {
  serverErrorItems: [],
  setServerErrorItems: jest.fn(),
  showServerErrors: jest.fn(),
};

const renderComponent = (
  serverErrorProps?: Partial<EnrolmentServerErrorsContextProps>
) =>
  render(
    <EnrolmentPageProvider>
      <EnrolmentServerErrorsContext.Provider
        value={{ ...defaultServerErrorsProps, ...serverErrorProps }}
      >
        <ReservationTimer
          attendees={[]}
          callbacksDisabled={false}
          disableCallbacks={jest.fn()}
          initReservationData={true}
          registration={registration}
          setAttendees={jest.fn()}
        />
      </EnrolmentServerErrorsContext.Provider>
    </EnrolmentPageProvider>,
    { session: fakeAuthenticatedSession() }
  );

beforeEach(() => {
  jest.resetAllMocks();
  // values stored in tests will also be available in other tests unless you run
  localStorage.clear();
  sessionStorage.clear();
});

test('should show server errors when creating seats reservation fails', async () => {
  const showServerErrors = jest.fn();

  setQueryMocks(
    rest.post(`*/reserve_seats/`, (req, res, ctx) =>
      res(ctx.status(400), ctx.json({}))
    )
  );
  singletonRouter.push({
    pathname: ROUTES.CREATE_ENROLMENT,
    query: { registrationId: TEST_REGISTRATION_ID },
  });
  renderComponent({ showServerErrors });

  await waitFor(() =>
    expect(showServerErrors).toBeCalledWith({ error: {} }, 'seatsReservation')
  );
});

test('should show modal if any of the reserved seats is in waiting list', async () => {
  const user = userEvent.setup();
  setQueryMocks(
    rest.post(`*/reserve_seats/`, (req, res, ctx) =>
      res(
        ctx.status(201),
        ctx.json(
          fakeSeatsReservation({
            seats: 1,
            waitlist_spots: 1,
            seats_at_event: 0,
          })
        )
      )
    )
  );
  singletonRouter.push({
    pathname: ROUTES.CREATE_ENROLMENT,
    query: { registrationId: TEST_REGISTRATION_ID },
  });
  renderComponent();

  const modal = await screen.findByRole('dialog', {
    name: 'Ilmoittautujia on lisätty varausjonoon',
  });

  await user.click(within(modal).getByRole('button', { name: 'Sulje' }));

  await waitFor(() => expect(modal).not.toBeInTheDocument());
});

test('should route to create enrolment page if reservation is expired', async () => {
  const user = userEvent.setup();

  setEnrolmentFormSessionStorageValues({
    registrationId: registration.id,
    seatsReservation: getMockedSeatsReservationData(-1000),
  });

  singletonRouter.push({
    pathname: ROUTES.CREATE_ENROLMENT_SUMMARY,
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

  await user.click(tryAgainButton);

  await waitFor(() =>
    expect(mockRouter.asPath).toBe(
      `/registration/${registration.id}/enrolment/create`
    )
  );
});

test('should reload page if reservation is expired and route is create enrolment page', async () => {
  mockRouter.reload = jest.fn();
  const user = userEvent.setup();

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

  await user.click(tryAgainButton);

  await waitFor(() => expect(mockRouter.reload).toBeCalled());
});
