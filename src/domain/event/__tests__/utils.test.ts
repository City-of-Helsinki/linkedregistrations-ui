/* eslint-disable @typescript-eslint/no-explicit-any */
import i18n from 'i18next';
import * as ics from 'ics';
import { clear, advanceTo } from 'jest-date-mock';

import {
  fakeEvent,
  fakeLocalisedObject,
  fakeOffers,
  fakePlace,
} from '../../../utils/mockDataUtils';
import { imagesResponse } from '../../image/__mocks__/image';
import { event } from '../__mocks__/event';
import { SuperEventType, TEST_EVENT_ID } from '../constants';
import {
  createEventIcsFile,
  downloadEventIcsFile,
  getEventAttributes,
  getEventFields,
  getEventLocationText,
} from '../utils';

afterEach(() => {
  clear();
  jest.restoreAllMocks();
});

describe('getEventFields function', () => {
  it('should return default values if value is not set', () => {
    const { audienceMaxAge, audienceMinAge, endTime, imageUrl, startTime } =
      getEventFields(
        fakeEvent({
          audience_max_age: null,
          audience_min_age: null,
          end_time: '',
          images: [],
          start_time: '',
        }),
        'fi'
      );

    expect(audienceMaxAge).toBe(null);
    expect(audienceMinAge).toBe(null);
    expect(endTime).toBe(null);
    expect(imageUrl).toBe(null);
    expect(startTime).toBe(null);
  });

  it('should return valid event fields', () => {
    const expectedDescription = fakeLocalisedObject('Event description');
    const expectedEndTime = '2021-02-22T18:00:00.000000Z';
    const expectedImageUrl = imagesResponse.data[0].url;
    const expectedStartTime = '2021-02-25T18:00:00.000000Z';
    const mockedOffers = fakeOffers(2, [
      { price: { fi: 'Hinta 1' }, is_free: false },
      { price: { fi: 'Hinta 2' }, is_free: true },
    ]);
    const expectedOffers = [mockedOffers[0]];

    const {
      audienceMaxAge,
      audienceMinAge,
      description,
      endTime,
      imageUrl,
      offers,
      startTime,
    } = getEventFields(
      fakeEvent({
        audience_max_age: 5,
        audience_min_age: 12,
        description: expectedDescription,
        end_time: expectedEndTime,
        images: imagesResponse.data,
        offers: mockedOffers,
        start_time: expectedStartTime,
      }),
      'fi'
    );

    expect(audienceMaxAge).toBe(5);
    expect(audienceMinAge).toBe(12);
    expect(description).toBe(expectedDescription?.fi);
    expect(endTime).toEqual(new Date(expectedEndTime));
    expect(imageUrl).toBe(expectedImageUrl);
    expect(offers).toEqual(expectedOffers);
    expect(startTime).toEqual(new Date(expectedStartTime));
  });
});

describe('getEventLocationText function', () => {
  test('should return location text', async () => {
    const result = getEventLocationText({
      event: {
        ...event,
        location: fakePlace({
          address_locality: fakeLocalisedObject('City'),
          name: fakeLocalisedObject('Name'),
          street_address: fakeLocalisedObject('Street'),
        }),
      },
      locale: 'fi',
    });

    expect(result).toEqual('Name, Street, City');
  });

  test('should return default value if place is missing', async () => {
    const result = getEventLocationText({
      event: { ...event, location: null },
      locale: 'fi',
    });

    expect(result).toEqual('-');
  });
});

describe('getEventAttributes', () => {
  const eventOverrides = {
    id: TEST_EVENT_ID,
    location: fakePlace({
      address_locality: fakeLocalisedObject('Helsinki'),
      name: fakeLocalisedObject('Location name'),
      street_address: fakeLocalisedObject('Street address'),
    }),
    name: fakeLocalisedObject('Event name'),
    short_description: fakeLocalisedObject('Event description'),
    end_time: '2022-07-10T12:00:00.000000Z',
    start_time: '2020-07-10T12:00:00.000000Z',
  };

  it('should get event attributes for ics file', async () => {
    const eventAttributes = getEventAttributes({
      event: fakeEvent(eventOverrides),
      locale: 'fi',
    });

    expect(eventAttributes).toEqual({
      description: 'Event description',
      end: [2022, 7, 10, 12, 0],
      location: 'Location name, Street address, Helsinki',
      start: [2020, 7, 10, 12, 0],
      title: 'Event name',
    });
  });

  it('should user start time as end time value', async () => {
    const eventAttributes = getEventAttributes({
      event: fakeEvent({ ...eventOverrides, end_time: null }),
      locale: 'fi',
    });

    expect(eventAttributes).toEqual({
      description: 'Event description',
      end: [2020, 7, 10, 12, 0],
      location: 'Location name, Street address, Helsinki',
      start: [2020, 7, 10, 12, 0],
      title: 'Event name',
    });
  });

  it('should user current time as start time value is start time is not defined', async () => {
    advanceTo('2023-12-05');
    const eventAttributes = getEventAttributes({
      event: fakeEvent({ ...eventOverrides, end_time: null, start_time: null }),
      locale: 'fi',
    });

    expect(eventAttributes).toEqual({
      description: 'Event description',
      end: [2023, 12, 5, 0, 0],
      location: 'Location name, Street address, Helsinki',
      start: [2023, 12, 5, 0, 0],
      title: 'Event name',
    });
  });
});

describe('createEventIcsFile', () => {
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

  const commonEventFileValues = {
    description: 'description',
    end: [2020, 7, 13, 5, 51],
    location: 'Location name, Street address, Helsinki',
    start: [2020, 7, 13, 5, 51],
  };

  it('should create ics file for single event', async () => {
    const createEvents = jest.spyOn(ics, 'createEvents');

    await createEventIcsFile({
      event: fakeEvent(commonEventOverrides),
      filename: '',
      locale: 'fi',
    });

    expect(createEvents).toHaveBeenCalledWith(
      [{ ...commonEventFileValues, title: 'name' }],
      expect.anything()
    );
  });

  it('should create ics file for recurring event', async () => {
    const createEvents = jest.spyOn(ics, 'createEvents');

    await createEventIcsFile({
      event: fakeEvent({
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
      }),
      filename: '',
      locale: 'fi',
    });

    expect(createEvents).toHaveBeenCalledWith(
      [
        { ...commonEventFileValues, title: 'sub-event 1' },
        { ...commonEventFileValues, title: 'sub-event 2' },
      ],
      expect.anything()
    );
  });
});

describe('downloadEventIcsFile', () => {
  it('should download the file successfully', async () => {
    const link = { click: jest.fn() } as any;
    const href = 'https://test.com';

    jest.spyOn(document, 'createElement').mockImplementation(() => link);
    global.URL.createObjectURL = jest.fn(() => href);
    global.URL.revokeObjectURL = jest.fn();

    await downloadEventIcsFile({
      addNotification: jest.fn(),
      event: fakeEvent({ id: TEST_EVENT_ID }),
      locale: 'fi',
      t: i18n.t.bind(i18n),
    });

    expect(link.download).toEqual(`event_${TEST_EVENT_ID}.ics`);
    expect(link.href).toEqual(href);
    expect(link.click).toHaveBeenCalledTimes(1);
  });

  it('should call addNotification if ics createEvent fails', async () => {
    jest
      .spyOn(ics, 'createEvents')
      .mockImplementation(((_: any, callback: ics.NodeCallback) =>
        callback(new Error('error'), '')) as any);
    const addNotification = jest.fn();

    await downloadEventIcsFile({
      addNotification,
      event: fakeEvent({ id: TEST_EVENT_ID }),
      locale: 'fi',
      t: i18n.t.bind(i18n),
    });

    expect(addNotification).toHaveBeenCalledWith({
      label: 'Kalenteritiedoston luominen epäonnistui.',
      type: 'error',
    });
  });
});
