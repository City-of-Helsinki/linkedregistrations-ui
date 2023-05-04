import { Language } from '../../types';
import getLocalisedString from '../../utils/getLocalisedString';
import { Event, EventFields } from './types';

export const getEventFields = (event: Event, locale: Language): EventFields => {
  return {
    audienceMaxAge: event.audience_max_age || null,
    audienceMinAge: event.audience_min_age || null,
    description: getLocalisedString(event.description, locale),
    endTime: event.end_time ? new Date(event.end_time) : null,
    freeEvent: !!event.offers[0]?.is_free,
    imageUrl: event.images.find((image) => image?.url)?.url || null,
    keywords: event.keywords.filter((id) => id),
    name: getLocalisedString(event.name, locale),
    offers: event.offers.filter((offer) => !!offer && !offer?.is_free),
    shortDescription: getLocalisedString(event.short_description, locale),
    startTime: event.start_time ? new Date(event.start_time) : null,
  };
};
