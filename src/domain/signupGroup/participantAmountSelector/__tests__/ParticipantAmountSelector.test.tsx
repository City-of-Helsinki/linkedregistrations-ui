import { Formik } from 'formik';
import { rest } from 'msw';
import React from 'react';

import {
  fakeSeatsReservation,
  getMockedSeatsReservationData,
  setSignupGroupFormSessionStorageValues,
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
import { SignupServerErrorsProvider } from '../../../signup/signupServerErrorsContext/SignupServerErrorsContext';
import { SIGNUP_INITIAL_VALUES } from '../../constants';
import { SignupGroupFormProvider } from '../../signupGroupFormContext/SignupGroupFormContext';
import ParticipantAmountSelector from '../ParticipantAmountSelector';

const renderComponent = () =>
  render(
    <SignupGroupFormProvider registration={registration}>
      <SignupServerErrorsProvider>
        <Formik
          initialValues={{ signups: [{ ...SIGNUP_INITIAL_VALUES }] }}
          onSubmit={() => undefined}
        >
          <ParticipantAmountSelector
            disabled={false}
            registration={registration}
          />
        </Formik>
      </SignupServerErrorsProvider>
    </SignupGroupFormProvider>
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
      return screen.getByRole('button', {
        name: /tallenna ilmoittautujamäärä/i,
      });
  }
};

test('should show modal if reserved seats are in waiting list', async () => {
  const user = userEvent.setup();

  const reservation = getMockedSeatsReservationData(1000);
  setSignupGroupFormSessionStorageValues({
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
    name: 'Olet ilmoittautumassa tapahtuman jonoon',
  });

  await user.click(within(modal).getByRole('button', { name: 'Sulje' }));

  await waitFor(() => expect(modal).not.toBeInTheDocument());
});
