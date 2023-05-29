import React from 'react';

import { fakeRegistration } from '../../../../../utils/mockDataUtils';
import { configure, render, screen } from '../../../../../utils/testUtils';
import { Registration } from '../../../../registration/types';
import AvailableSeatsText from '../AvailableSeatsText';

configure({ defaultHidden: true });

const renderComponent = (registration: Registration) =>
  render(<AvailableSeatsText registration={registration} />);

test('should show amount of free seats ', () => {
  renderComponent(
    fakeRegistration({
      maximum_attendee_capacity: 10,
      current_attendee_count: 3,
      remaining_attendee_capacity: 7,
    })
  );

  screen.getByText('Saatavilla olevia paikkoja');
  screen.getByText('7');
});

test('should show amount of remaining seats ', () => {
  renderComponent(
    fakeRegistration({
      maximum_attendee_capacity: 10,
      current_attendee_count: 3,
      remaining_attendee_capacity: 0,
    })
  );

  screen.getByText('Saatavilla olevia paikkoja');
  screen.getByText('0');
});

test('should show amount of free waiting list seats', () => {
  renderComponent(
    fakeRegistration({
      maximum_attendee_capacity: 10,
      current_attendee_count: 10,
      current_waiting_list_count: 3,
      remaining_attendee_capacity: 0,
      remaining_waiting_list_capacity: 7,
      waiting_list_capacity: 10,
    })
  );

  screen.getByText('Saatavilla olevia jonopaikkoja');
  screen.getByText('7');
});

test('should show amount of remaining waiting list seats ', () => {
  renderComponent(
    fakeRegistration({
      maximum_attendee_capacity: 10,
      current_attendee_count: 10,
      current_waiting_list_count: 3,
      remaining_attendee_capacity: 0,
      remaining_waiting_list_capacity: 0,
      waiting_list_capacity: 10,
    })
  );

  screen.getByText('Saatavilla olevia jonopaikkoja');
  screen.getByText('0');
});
