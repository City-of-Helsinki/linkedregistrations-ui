/* eslint-disable @typescript-eslint/no-require-imports */
import addSeconds from 'date-fns/addSeconds';
import subSeconds from 'date-fns/subSeconds';
import { Formik } from 'formik';
import { rest } from 'msw';
import React from 'react';

import { RESERVATION_NAMES } from '../../../../constants';
import { fakeSeatsReservation } from '../../../../utils/mockDataUtils';
import {
  render,
  screen,
  setQueryMocks,
  userEvent,
  waitFor,
  within,
} from '../../../../utils/testUtils';
import { registration } from '../../../registration/__mocks__/registration';
import { SeatsReservation } from '../../../reserveSeats/types';
import { ATTENDEE_INITIAL_VALUES } from '../../constants';
import { EnrolmentPageProvider } from '../../enrolmentPageContext/EnrolmentPageContext';
import { EnrolmentServerErrorsProvider } from '../../enrolmentServerErrorsContext/EnrolmentServerErrorsContext';
import ParticipantAmountSelector from '../ParticipantAmountSelector';

const renderComponent = () =>
  render(
    <EnrolmentPageProvider>
      <EnrolmentServerErrorsProvider>
        <Formik
          initialValues={{ attendees: [{ ...ATTENDEE_INITIAL_VALUES }] }}
          onSubmit={() => undefined}
        >
          <ParticipantAmountSelector
            disabled={false}
            registration={registration}
          />
        </Formik>
      </EnrolmentServerErrorsProvider>
    </EnrolmentPageProvider>
  );

beforeEach(() => {
  // values stored in tests will also be available in other tests unless you run
  localStorage.clear();
  sessionStorage.clear();
});

const getElement = (
  key: 'participantAmountInput' | 'updateParticipantAmountButton'
) => {
  switch (key) {
    case 'participantAmountInput':
      return screen.getByRole('spinbutton', {
        name: /ilmoittautujien määrä \*/i,
      });
    case 'updateParticipantAmountButton':
      return screen.getByRole('button', { name: /päivitä/i });
  }
};

const setSessionStorageValues = (reservation: SeatsReservation) => {
  jest.spyOn(sessionStorage, 'getItem').mockImplementation((key: string) => {
    switch (key) {
      case `${RESERVATION_NAMES.ENROLMENT_RESERVATION}-${registration.id}`:
        return reservation ? JSON.stringify(reservation) : '';
      default:
        return '';
    }
  });
};

const getReservationData = (expirationOffset: number) => {
  const now = new Date();
  let expiration = '';

  if (expirationOffset) {
    expiration = addSeconds(now, expirationOffset).toISOString();
  } else {
    expiration = subSeconds(now, expirationOffset).toISOString();
  }

  const reservation = fakeSeatsReservation({ expiration });

  return reservation;
};

test('should show modal if any of the reserved seats is in waiting list', async () => {
  const user = userEvent.setup();

  setSessionStorageValues(getReservationData(1000));
  setQueryMocks(
    rest.post(`*/reserve_seats/`, (req, res, ctx) =>
      res(
        ctx.status(201),
        ctx.json(
          fakeSeatsReservation({
            seats: 2,
            waitlist_spots: 1,
            seats_at_event: 1,
          })
        )
      )
    )
  );
  renderComponent();

  const participantAmountInput = getElement('participantAmountInput');
  const updateParticipantAmountButton = getElement(
    'updateParticipantAmountButton'
  );

  await user.clear(participantAmountInput);
  await user.type(participantAmountInput, '2');
  await user.click(updateParticipantAmountButton);

  const modal = await screen.findByRole('dialog', {
    name: 'Ilmoittautujia on lisätty varausjonoon',
  });

  await user.click(within(modal).getByRole('button', { name: 'Sulje' }));

  await waitFor(() => expect(modal).not.toBeInTheDocument());
});