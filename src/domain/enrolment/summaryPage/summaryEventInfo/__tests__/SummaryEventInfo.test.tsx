import { rest } from 'msw';
import React from 'react';

import {
  configure,
  render,
  screen,
  setQueryMocks,
} from '../../../../../utils/testUtils';
import {
  event,
  eventOverrides,
  locationText,
} from '../../../../event/__mocks__/event';
import { place } from '../../../../place/__mocks__/place';
import { TEST_PLACE_ID } from '../../../../place/constants';
import { registration } from '../../../../registration/__mocks__/registration';
import SummaryEventInfo from '../SummaryEventInfo';

configure({ defaultHidden: true });

const findElement = (key: 'location') => {
  switch (key) {
    case 'location':
      return screen.findByText(locationText);
  }
};

const getElement = (key: 'age' | 'date' | 'name' | 'price') => {
  switch (key) {
    case 'age':
      return screen.getByText('8 – 18 v');
    case 'date':
      return screen.getByText('10.07.2020 – 13.07.2020');
    case 'name':
      return screen.getByText(eventOverrides.name.fi as string);
    case 'price':
      return screen.getByText(eventOverrides.offers[0].price.fi as string);
  }
};

beforeEach(() => {
  setQueryMocks(
    rest.get(`*/place/${TEST_PLACE_ID}/`, (req, res, ctx) =>
      res(ctx.status(200), ctx.json(place))
    )
  );
});

test('should show event info', async () => {
  render(<SummaryEventInfo registration={registration} />);

  await findElement('location');
  getElement('name');
  getElement('price');
  getElement('age');
});

test('should show event time correctly if only start time is defined', async () => {
  render(
    <SummaryEventInfo
      registration={{ ...registration, event: { ...event, end_time: null } }}
    />
  );

  screen.getByText('10.7.2020, 15.00 –');
});

test('should show event time correctly if only end time is defined', async () => {
  render(
    <SummaryEventInfo
      registration={{ ...registration, event: { ...event, start_time: null } }}
    />
  );

  screen.getByText('– 13.7.2020, 15.00');
});
