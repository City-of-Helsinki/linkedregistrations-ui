import { Language } from '../../types';
import { getLinkedEventsUrl } from '../../utils/getLinkedEventsPath';
import getLocalisedString from '../../utils/getLocalisedString';
import queryBuilder from '../../utils/queryBuilder';
import { Event, EventFields, EventQueryVariables } from './types';

export const fetchEvent = (args: EventQueryVariables): Promise<Event> =>
  fetch(getLinkedEventsUrl(eventPathBuilder(args))).then((res) => res.json());

export const eventPathBuilder = (args: EventQueryVariables): string => {
  const { id, include } = args;
  const variableToKeyItems = [{ key: 'include', value: include }];

  const query = queryBuilder(variableToKeyItems);

  return `/event/${id}/${query}`;
};
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
