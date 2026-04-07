import { http, HttpResponse } from 'msw';
import React from 'react';

import {
  fakeEvent,
  fakeLocalisedObject,
} from '../../../../utils/mockDataUtils';
import {
  configure,
  render,
  screen,
  setQueryMocks,
} from '../../../../utils/testUtils';
import { eventOverrides, locationText } from '../../../event/__mocks__/event';
import { keywordsOverrides } from '../../../keyword/__mocks__/keyword';
import { place } from '../../../place/__mocks__/place';
import { TEST_PLACE_ID } from '../../../place/constants';
import { registration } from '../../../registration/__mocks__/registration';
import EventInfo from '../EventInfo';

configure({ defaultHidden: true });

const event = fakeEvent({
  ...eventOverrides,
  end_time: '2020-07-13T12:00:00.000000Z',
  start_time: '2020-07-10T12:00:00.000000Z',
});

const findLocationText = () => screen.findByText(locationText);

const getElement = (key: 'age' | 'date' | 'description' | 'name' | 'price') => {
  switch (key) {
    case 'age':
      return screen.getByText('8 – 18 v');
    case 'date':
      return screen.getByText('10.07.2020 – 13.07.2020');
    case 'description':
      return screen.getByText(eventOverrides.description?.fi as string);
    case 'name':
      return screen.getByText(eventOverrides.name?.fi as string);
    case 'price':
      return screen.getByText(eventOverrides.offers[0].price?.fi as string);
  }
};

beforeEach(() => {
  setQueryMocks(
    http.get(`*/place/${TEST_PLACE_ID}/`, () => HttpResponse.json(place))
  );
});

test('should show event info', async () => {
  render(<EventInfo event={event} registration={registration} />);

  await findLocationText();
  getElement('name');
  keywordsOverrides.forEach((item) =>
    screen.getByText(item.name?.fi as string)
  );
  getElement('description');
  getElement('price');
  getElement('age');
});

test('should show event time correctly if only start time is defined', async () => {
  render(
    <EventInfo
      event={{ ...event, end_time: null }}
      registration={registration}
    />
  );

  screen.getByText('10.7.2020, 15.00 –');
});

test('should show event time correctly if only end time is defined', async () => {
  render(
    <EventInfo
      event={{ ...event, start_time: null }}
      registration={registration}
    />
  );

  screen.getByText('– 13.7.2020, 15.00');
});

test('should not show registration instructions text', async () => {
  render(
    <EventInfo
      event={event}
      registration={{ ...registration, instructions: null }}
    />
  );

  expect(screen.queryByText('Ilmoittautumisohjeet')).not.toBeInTheDocument();
});

test('should show registration instructions text', async () => {
  render(
    <EventInfo
      event={event}
      registration={{
        ...registration,
        instructions: fakeLocalisedObject('Ohjeet ilmoittautumiseen'),
      }}
    />
  );

  screen.getByText('Ilmoittautumisohjeet');
  screen.getByText('Ohjeet ilmoittautumiseen');
});
