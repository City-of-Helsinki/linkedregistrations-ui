/* eslint-disable @typescript-eslint/no-explicit-any */
import { rest } from 'msw';
import React from 'react';

import {
  fakeEvent,
  fakeLocalisedObject,
  fakePlace,
} from '../../../../utils/mockDataUtils';
import {
  render,
  screen,
  setQueryMocks,
  userEvent,
  waitFor,
} from '../../../../utils/testUtils';
import { SuperEventType, TEST_EVENT_ID } from '../../constants';
import EventCalendarButton, {
  EventCalendarButtonProps,
} from '../EventCalendarButton';

const defaultProps: EventCalendarButtonProps = {
  event: fakeEvent({ id: TEST_EVENT_ID }),
};

afterEach(() => {
  jest.restoreAllMocks();
});

const renderComponent = (props?: Partial<EventCalendarButtonProps>) =>
  render(<EventCalendarButton {...defaultProps} {...props} />);

test('should download an ics file successfully', async () => {
  const user = userEvent.setup();
  renderComponent();

  // Mock these functions after renderComponent to avoid issues with initial rendering
  const link = { click: jest.fn() } as any;
  const href = 'https://test.com';
  jest.spyOn(document, 'createElement').mockImplementation(() => link);
  global.URL.createObjectURL = jest.fn(() => href);
  global.URL.revokeObjectURL = jest.fn();

  const addToCalendarButton = screen.getByRole('button', {
    name: 'Lisää kalenteriin',
  });
  await user.click(addToCalendarButton);

  expect(link.download).toEqual(`event_${TEST_EVENT_ID}.ics`);
  expect(link.href).toEqual(href);
  expect(link.click).toHaveBeenCalledTimes(1);
});

test('should download an ics file successfully for recurring event', async () => {
  const commonEventOverrides = {
    id: TEST_EVENT_ID,
    location: fakePlace({
      address_locality: fakeLocalisedObject('Helsinki'),
      name: fakeLocalisedObject('Location name'),
      street_address: fakeLocalisedObject('Street address'),
    }),
    name: fakeLocalisedObject('name'),
    short_description: fakeLocalisedObject('description'),
  };
  const recurringEvent = fakeEvent({
    ...commonEventOverrides,
    super_event_type: SuperEventType.Recurring,
    sub_events: [
      fakeEvent({
        ...commonEventOverrides,
        name: fakeLocalisedObject('sub-event 1'),
      }),
      fakeEvent({
        ...commonEventOverrides,
        name: fakeLocalisedObject('sub-event 2'),
      }),
    ],
  });

  const user = userEvent.setup();
  setQueryMocks(
    rest.get(`*/event/${TEST_EVENT_ID}/`, (req, res, ctx) =>
      res(ctx.status(200), ctx.json(recurringEvent))
    )
  );
  renderComponent({ event: recurringEvent });

  // Mock these functions after renderComponent to avoid issues with initial rendering
  const link = { click: jest.fn() } as any;
  const href = 'https://test.com';
  jest.spyOn(document, 'createElement').mockImplementation(() => link);
  global.URL.createObjectURL = jest.fn(() => href);
  global.URL.revokeObjectURL = jest.fn();

  const addToCalendarButton = screen.getByRole('button', {
    name: 'Lisää kalenteriin',
  });
  await waitFor(() => expect(addToCalendarButton).toBeEnabled());
  await user.click(addToCalendarButton);

  expect(link.download).toEqual(`event_${TEST_EVENT_ID}.ics`);
  expect(link.href).toEqual(href);
  expect(link.click).toHaveBeenCalledTimes(1);
});

test('should call custom onClick function', async () => {
  const user = userEvent.setup();
  const onClick = jest.fn();
  renderComponent({ onClick });

  const addToCalendarButton = screen.getByRole('button', {
    name: 'Lisää kalenteriin',
  });
  await user.click(addToCalendarButton);

  expect(onClick).toHaveBeenCalledTimes(1);
});
