/* eslint-disable @typescript-eslint/no-explicit-any */
import { faker } from '@faker-js/faker';
import merge from 'lodash/merge';

import { LocalisedObject, Meta } from '../domain/api/types';
import {
  ATTENDEE_STATUS,
  NOTIFICATION_TYPE,
} from '../domain/enrolment/constants';
import { Enrolment } from '../domain/enrolment/types';
import {
  EventStatus,
  EventTypeId,
  PublicationStatus,
  TEST_EVENT_ID,
} from '../domain/event/constants';
import { Event, Offer } from '../domain/event/types';
import { Image, ImagesResponse } from '../domain/image/types';
import { Keyword, KeywordsResponse } from '../domain/keyword/types';
import { LanguagesResponse, LELanguage } from '../domain/language/types';
import { Place } from '../domain/place/types';
import { TEST_REGISTRATION_ID } from '../domain/registration/constants';
import {
  Registration,
  RegistrationsResponse,
} from '../domain/registration/types';
import { User } from '../domain/user/types';
import generateAtId from './generateAtId';

export const fakeEnrolment = (overrides?: Partial<Enrolment>): Enrolment => {
  const id = overrides?.id || faker.datatype.uuid();

  return merge<Enrolment, typeof overrides>(
    {
      id,
      attendee_status: ATTENDEE_STATUS.Attending,
      cancellation_code: faker.datatype.uuid(),
      city: faker.address.city(),
      date_of_birth: '1990-10-10',
      email: faker.internet.email(),
      extra_info: faker.lorem.paragraph(),
      membership_number: faker.datatype.uuid(),
      name: faker.name.firstName(),
      native_language: 'fi',
      notifications: NOTIFICATION_TYPE.SMS_EMAIL,
      phone_number: faker.phone.number(),
      registration: TEST_REGISTRATION_ID,
      service_language: 'fi',
      street_address: faker.address.streetAddress(),
      zipcode: faker.address.zipCode('#####'),
    },
    overrides
  );
};

export const fakeEvent = (overrides?: Partial<Event>): Event => {
  const id = overrides?.id || faker.datatype.uuid();

  return merge<Event, typeof overrides>(
    {
      id,
      audience: [],
      audience_max_age: null,
      audience_min_age: null,
      custom_data: null,
      created_by: null,
      created_time: null,
      data_source: 'hel',
      date_published: null,
      deleted: null,
      description: fakeLocalisedObject(),
      end_time: null,
      enrolment_end_time: null,
      enrolment_start_time: null,
      event_status: EventStatus.EventScheduled,
      external_links: [],
      images: [],
      info_url: fakeLocalisedObject(),
      in_language: [],
      keywords: [],
      last_modified_time: '2020-07-13T05:51:05.761000Z',
      location: fakePlace(),
      location_extra_info: fakeLocalisedObject(faker.address.streetAddress()),
      maximum_attendee_capacity: null,
      minimum_attendee_capacity: null,
      name: fakeLocalisedObject(faker.name.jobTitle()),
      offers: [],
      provider_contact_info: null,
      provider: fakeLocalisedObject(),
      publication_status: PublicationStatus.Public,
      publisher: faker.datatype.uuid(),
      short_description: fakeLocalisedObject(),
      start_time: '2020-07-13T05:51:05.761000Z',
      sub_events: [],
      super_event: null,
      super_event_type: null,
      type_id: EventTypeId.General,
      videos: [],
      '@id': generateAtId(id, 'event'),
      '@context': 'http://schema.org',
      '@type': 'Event',
    },
    overrides
  );
};

export const fakeImages = (
  count = 1,
  images?: Partial<Image>[]
): ImagesResponse => ({
  data: generateNodeArray((i) => fakeImage(images?.[i]), count),
  meta: fakeMeta(count),
});

export const fakeImage = (overrides?: Partial<Image>): Image => {
  const id = overrides?.id || faker.datatype.uuid();

  return merge<Image, typeof overrides>(
    {
      id,
      alt_text: faker.image.cats(),
      created_time: null,
      cropping: '59,0,503,444',
      data_source: 'hel',
      last_modified_time: null,
      license: 'cc_by',
      name: faker.random.words(),
      photographer_name: faker.name.firstName(),
      publisher: faker.datatype.uuid(),
      url: faker.internet.url(),
      '@id': generateAtId(id, 'image'),
      '@context': 'http://schema.org',
      '@type': 'Image',
    },
    overrides
  );
};

export const fakeKeywords = (
  count = 1,
  keywords?: Partial<Keyword>[]
): KeywordsResponse => ({
  data: generateNodeArray((i) => fakeKeyword(keywords?.[i]), count),
  meta: fakeMeta(count),
});

export const fakeKeyword = (overrides?: Partial<Keyword>): Keyword => {
  const id = overrides?.id || faker.datatype.uuid();

  return merge<Keyword, typeof overrides>(
    {
      id,
      aggregate: false,
      alt_labels: [],
      created_time: null,
      data_source: 'yso',
      deprecated: false,
      has_upcoming_events: true,
      last_modified_time: null,
      image: null,
      name: fakeLocalisedObject(),
      n_nvents: 0,
      publisher: faker.datatype.uuid(),
      '@id': generateAtId(id, 'keyword'),
      '@context': 'http://schema.org',
      '@type': 'Keyword',
    },
    overrides
  );
};

export const fakeLanguages = (
  count = 1,
  languages?: Partial<LELanguage>[]
): LanguagesResponse => ({
  data: generateNodeArray((i) => fakeLanguage(languages?.[i]), count),
  meta: fakeMeta(count),
});

export const fakeLanguage = (overrides?: Partial<LELanguage>): LELanguage => {
  const id = overrides?.id || faker.datatype.uuid();

  return merge<LELanguage, typeof overrides>(
    {
      id,
      translation_available: false,
      name: fakeLocalisedObject(),
      '@id': generateAtId(id, 'language'),
      '@context': 'http://schema.org',
      '@type': 'Language',
    },
    overrides
  );
};

export const fakeOffers = (count = 1, offers?: Partial<Offer>[]): Offer[] =>
  generateNodeArray((i) => fakeOffer(offers?.[i]), count);

export const fakeOffer = (overrides?: Partial<Offer>): Offer =>
  merge<Offer, typeof overrides>(
    {
      description: fakeLocalisedObject(),
      info_url: fakeLocalisedObject(faker.internet.url()),
      is_free: false,
      price: fakeLocalisedObject(),
    },
    overrides
  );

export const fakePlace = (overrides?: Partial<Place>): Place => {
  const id = overrides?.id || faker.datatype.uuid();

  return merge<Place, typeof overrides>(
    {
      id,
      address_country: null,
      address_locality: fakeLocalisedObject(),
      address_region: null,
      contact_type: null,
      created_time: '2021-02-22T18:14:28.345694Z',
      custom_data: null,
      data_source: 'tprek',
      deleted: false,
      description: null,
      divisions: [],
      email: faker.internet.email(),
      info_url: fakeLocalisedObject(faker.internet.url()),
      image: null,
      last_modified_time: '2021-02-22T18:14:28.659508Z',
      name: fakeLocalisedObject(),
      n_events: 0,
      parent: null,
      position: null,
      postal_code: faker.address.zipCode(),
      post_office_box_num: null,
      publisher: 'hel:1234',
      replaced_by: null,
      street_address: fakeLocalisedObject(),
      telephone: fakeLocalisedObject(),
      has_upcoming_events: true,
      '@id': generateAtId(id, 'place'),
      '@context': 'http://schema.org',
      '@type': 'Place',
    },
    overrides
  );
};

export const fakeRegistrations = (
  count = 1,
  registrations?: Partial<Registration>[]
): RegistrationsResponse => ({
  data: generateNodeArray((i) => fakeRegistration(registrations?.[i]), count),
  meta: fakeMeta(count),
});

export const fakeRegistration = (
  overrides?: Partial<Registration>
): Registration => {
  const id = overrides?.id || faker.datatype.uuid();

  return merge<Registration, typeof overrides>(
    {
      id,
      attendee_registration: false,
      audience_max_age: null,
      audience_min_age: null,
      confirmation_message: faker.lorem.paragraph(),
      created_at: null,
      created_by: faker.name.firstName(),
      current_attendee_count: 0,
      current_waiting_list_count: 0,
      enrolment_end_time: '2020-09-30T16:00:00.000000Z',
      enrolment_start_time: '2020-09-27T15:00:00.000000Z',
      event: TEST_EVENT_ID,
      instructions: faker.lorem.paragraph(),
      last_modified_at: '2020-09-12T15:00:00.000000Z',
      last_modified_by: '',
      maximum_attendee_capacity: null,
      minimum_attendee_capacity: null,
      waiting_list_capacity: null,
    },
    overrides
  );
};

export const fakeUser = (overrides?: Partial<User>): User => {
  const uuid = overrides?.uuid || faker.datatype.uuid();
  return merge<User, typeof overrides>(
    {
      admin_organizations: [],
      date_joined: null,
      department_name: faker.random.words(),
      display_name: faker.random.words(),
      email: faker.internet.email(),
      first_name: faker.name.firstName(),
      is_staff: false,
      last_login: '',
      last_name: faker.name.lastName(),
      organization: faker.random.words(),
      organization_memberships: [],
      username: faker.datatype.uuid(),
      uuid,
      '@id': generateAtId(uuid, 'user'),
      '@context': 'http://schema.org',
      '@type': 'User',
    },
    overrides
  );
};

export const fakeLocalisedObject = (text?: string): LocalisedObject => ({
  ar: faker.random.words(),
  en: faker.random.words(),
  fi: text || faker.random.words(),
  ru: faker.random.words(),
  sv: faker.random.words(),
  zh_hans: faker.random.words(),
});

export const fakeMeta = (count = 1, overrides?: Partial<Meta>): Meta =>
  merge<Meta, typeof overrides>(
    {
      count: count,
      next: '',
      previous: '',
    },
    overrides
  );

const generateNodeArray = <T extends (...args: any) => any>(
  fakeFunc: T,
  length: number
): ReturnType<T>[] => {
  return Array.from({ length }).map((_, i) => fakeFunc(i));
};
