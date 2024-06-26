import { AxiosError } from 'axios';
import isPast from 'date-fns/isPast';
import { DateArray, DateTime, EventAttributes, createEvents } from 'ics';
import { TFunction } from 'next-i18next';

import { AddNotificationFn } from '../../common/components/notificationsContext/NotificationsContext';
import { ExtendedSession, Language } from '../../types';
import getLocalisedString from '../../utils/getLocalisedString';
import queryBuilder, { VariableToKeyItem } from '../../utils/queryBuilder';
import { callGet } from '../app/axios/axiosClient';
import { getPlaceFields } from '../place/utils';

import { EventStatus, PublicationStatus, SuperEventType } from './constants';
import { Event, EventFields, EventQueryVariables } from './types';

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

export const getEventLocationText = ({
  event,
  locale,
}: {
  event: Event;
  locale: Language;
}): string => {
  const { location } = event;
  const {
    addressLocality,
    name: locationName,
    streetAddress,
  } = location
    ? getPlaceFields(location, locale)
    : { addressLocality: '', name: '', streetAddress: '' };

  return (
    [locationName, streetAddress, addressLocality]
      .filter((e) => e)
      .join(', ') || '-'
  );
};

const getDateArray = (date: Date): DateArray => [
  date.getFullYear(),
  date.getMonth() + 1,
  date.getDate(),
  date.getHours(),
  date.getMinutes(),
];

export const getEventAttributes = ({
  event,
  locale,
}: {
  event: Event;
  locale: Language;
}) => {
  const { name, shortDescription } = getEventFields(event, locale);
  const startTime = event.start_time ? new Date(event.start_time) : new Date();
  const endTime = event.end_time ? new Date(event.end_time) : null;

  const start: DateTime = getDateArray(startTime);
  const end: DateTime = endTime ? getDateArray(endTime) : start;
  const eventAttributes: EventAttributes = {
    start,
    end,
    title: name,
    description: shortDescription,
    location: getEventLocationText({ event, locale }),
  };

  return eventAttributes;
};

export const getCalendarEvents = (event: Event): Event[] => {
  if (event.super_event_type === SuperEventType.Recurring) {
    return event.sub_events.filter(
      (subEvent) =>
        !subEvent.deleted &&
        [EventStatus.EventRescheduled, EventStatus.EventScheduled].includes(
          subEvent.event_status
        ) &&
        subEvent.publication_status === PublicationStatus.Public
    );
  }
  return [event];
};

export const createEventIcsFile = async ({
  event,
  filename,
  locale,
}: {
  event: Event;
  filename: string;
  locale: Language;
}): Promise<File> =>
  new Promise((resolve, reject) => {
    createEvents(
      getCalendarEvents(event).map((eventItem) =>
        getEventAttributes({ event: eventItem, locale })
      ),
      (error, value) => {
        if (error) {
          reject(error);
        }
        resolve(new File([value], filename, { type: 'text/calendar' }));
      }
    );
  });

export const downloadEventIcsFile = async ({
  addNotification,
  event,
  locale,
  t,
}: {
  addNotification: AddNotificationFn;
  event: Event;
  locale: Language;
  t: TFunction;
}) => {
  try {
    const filename = `event_${event.id}.ics`;

    const file: File = await createEventIcsFile({
      event,
      filename,
      locale,
    });

    const href = URL.createObjectURL(file);
    const anchor = document.createElement('a');
    anchor.download = filename;
    anchor.href = href;
    anchor.click();

    URL.revokeObjectURL(href);
  } catch {
    addNotification({
      label: t('common:eventCalendarButton.failedToCreateFile'),
      type: 'error',
    });
  }
};

export const fetchEvent = async (
  args: EventQueryVariables,
  session: ExtendedSession | null
): Promise<Event> => {
  try {
    const { data } = await callGet({
      session,
      url: eventPathBuilder(args),
    });
    return data;
  } catch (error) {
    throw Error(JSON.stringify((error as AxiosError).response?.data));
  }
};

export const eventPathBuilder = ({
  nocache = true,
  ...args
}: EventQueryVariables): string => {
  const { id, include } = args;
  const variableToKeyItems: VariableToKeyItem[] = [
    { key: 'include', value: include },
  ];

  if (nocache) {
    variableToKeyItems.push({ key: 'nocache', value: nocache });
  }

  const query = queryBuilder(variableToKeyItems);

  return `/event/${id}/${query}`;
};

export const isEventStarted = (event: Event): boolean => {
  const startTime = event.start_time ? new Date(event.start_time) : null;
  return startTime ? isPast(startTime) : false;
};
