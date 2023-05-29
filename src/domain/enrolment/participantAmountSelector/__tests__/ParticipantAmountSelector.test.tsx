import { Formik } from 'formik';
import { rest } from 'msw';
import React from 'react';

import {
  fakeSeatsReservation,
  getMockedSeatsReservationData,
  setEnrolmentFormSessionStorageValues,
} from '../../../../utils/mockDataUtils';
import {
  render,
  screen,
  setQueryMocks,
  userEvent,
  waitFor,
  within,
} from '../../../../utils/testUtils';
import { registration } from '../../../registration/__mocks__/registration';
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

test('should show modal if reserved seats are in waiting list', async () => {
  const user = userEvent.setup();

  const reservation = getMockedSeatsReservationData(1000);
  setEnrolmentFormSessionStorageValues({
    registrationId: registration.id,
    seatsReservation: reservation,
  });
  setQueryMocks(
    rest.put(`*/seats_reservation/${reservation.id}`, (req, res, ctx) =>
      res(
        ctx.status(200),
        ctx.json(
          fakeSeatsReservation({
            seats: 2,
            in_waitlist: true,
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
