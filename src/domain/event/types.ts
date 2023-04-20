import {
  LocalisedObject,
  dateOrNull,
  numberOrNull,
  stringOrNull,
} from '../api/types';
import { Image } from '../image/types';
import { Keyword } from '../keyword/types';
import { LELanguage } from '../language/types';
import { Place } from '../place/types';
import {
  EventStatus,
  EventTypeId,
  PublicationStatus,
  SuperEventType,
} from './constants';

type ExternalLink = {
  name: stringOrNull;
  link: stringOrNull;
  language: stringOrNull;
};

export type Offer = {
  description: LocalisedObject;
  info_url: LocalisedObject;
  is_free: boolean;
  price: LocalisedObject;
};

type Video = {
  altText: stringOrNull;
  name: stringOrNull;
  url: stringOrNull;
};

export type Event = {
  id: string;
  audience: Keyword[];
  audience_max_age: numberOrNull;
  audience_min_age: numberOrNull;
  created_by: stringOrNull;
  created_time: stringOrNull;
  custom_data: stringOrNull;
  data_source: stringOrNull;
  date_published: stringOrNull;
  deleted: stringOrNull;
  description: LocalisedObject;
  end_time: stringOrNull;
  enrolment_end_time: stringOrNull;
  enrolment_start_time: stringOrNull;
  external_links: ExternalLink[];
  event_status: EventStatus;
  images: Image[];
  info_url: LocalisedObject;
  in_language: LELanguage[];
  keywords: Keyword[];
  last_modified_time: stringOrNull;
  location: Place | null;
  location_extra_info: LocalisedObject;
  maximum_attendee_capacity: numberOrNull;
  minimum_attendee_capacity: numberOrNull;
  name: LocalisedObject;
  offers: Offer[];
  provider: LocalisedObject;
  provider_contact_info: stringOrNull;
  publisher: string;
  publication_status: PublicationStatus;
  short_description: LocalisedObject;
  start_time: stringOrNull;
  sub_events: Event[];
  super_event: Event | null;
  super_event_type: SuperEventType | null;
  type_id: EventTypeId;
  videos: Video[];
  '@id': string;
  '@context': string;
  '@type': string;
};

export type EventFields = {
  audienceMaxAge: numberOrNull;
  audienceMinAge: numberOrNull;
  description: string;
  endTime: dateOrNull;
  freeEvent: boolean;
  imageUrl: stringOrNull;
  keywords: Keyword[];
  name: string;
  offers: Offer[];
  shortDescription: string;
  startTime: Date | null;
};
