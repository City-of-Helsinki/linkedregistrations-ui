import { http, HttpResponse } from 'msw';
import React from 'react';

import { fakeEvent } from '../../../../utils/mockDataUtils';
import {
  loadingSpinnerIsNotInDocument,
  render,
  screen,
  setQueryMocks,
  userEvent,
} from '../../../../utils/testUtils';
import { SuperEventType } from '../../../event/constants';
import EventTimes, { EventTimesProps } from '../EventTimes';

const eventWithSubEvents = fakeEvent({
  super_event_type: SuperEventType.Recurring,
  sub_events: [
    fakeEvent({
      start_time: '2024-01-01T12:00:00.000000Z',
      end_time: '2024-01-01T13:00:00.000000Z',
    }),
    fakeEvent({
      start_time: '2024-01-02T13:00:00.000000Z',
      end_time: '2024-01-02T14:00:00.000000Z',
    }),
    fakeEvent({
      start_time: '2024-01-03T14:00:00.000000Z',
      end_time: '2024-01-03T15:00:00.000000Z',
    }),
  ],
});

const defaultProps: EventTimesProps = { event: eventWithSubEvents };

const renderComponent = (props?: Partial<EventTimesProps>) =>
  render(<EventTimes {...defaultProps} {...props} />);

test('should show event times if event is recurring event', async () => {
  const user = userEvent.setup();
  setQueryMocks(
    http.get(`*/event/${eventWithSubEvents.id}/`, () =>
      HttpResponse.json(eventWithSubEvents)
    )
  );
  renderComponent();

  const toggleButton = await screen.findByRole('button', {
    name: 'Kaikki tapahtuma-ajat',
  });
  await user.click(toggleButton);
  await loadingSpinnerIsNotInDocument();
  screen.getByText('1.1.2024, 14.00 – 15.00');
  screen.getByText('2.1.2024, 15.00 – 16.00');
  screen.findByText('3.1.2024, 16.00 – 17.00');
});

test('should not show event times if super event type is null', async () => {
  renderComponent({ event: fakeEvent({ super_event_type: null }) });

  expect(
    screen.queryByRole('button', { name: 'Kaikki tapahtuma-ajat' })
  ).not.toBeInTheDocument();
});
