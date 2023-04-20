import {
  fakeEvent,
  fakeLocalisedObject,
  fakeOffers,
} from '../../../utils/mockDataUtils';
import { imagesResponse } from '../../image/__mocks__/image';
import { getEventFields } from '../utils';

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
    expect(description).toBe(expectedDescription.fi);
    expect(endTime).toEqual(new Date(expectedEndTime));
    expect(imageUrl).toBe(expectedImageUrl);
    expect(offers).toEqual(expectedOffers);
    expect(startTime).toEqual(new Date(expectedStartTime));
  });
});
