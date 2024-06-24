/* eslint-disable @typescript-eslint/no-explicit-any */
import { faker } from '@faker-js/faker';
import addMinutes from 'date-fns/addMinutes';
import addSeconds from 'date-fns/addSeconds';
import { FormikState } from 'formik';
import merge from 'lodash/merge';

import { FORM_NAMES, RESERVATION_NAMES } from '../constants';
import { LocalisedObject, Meta } from '../domain/api/types';
import {
  EventStatus,
  EventTypeId,
  PublicationStatus,
} from '../domain/event/constants';
import { Event, Offer } from '../domain/event/types';
import { Image, ImagesResponse } from '../domain/image/types';
import { Keyword, KeywordsResponse } from '../domain/keyword/types';
import { LanguagesResponse, LELanguage } from '../domain/language/types';
import { Place } from '../domain/place/types';
import {
  PriceGroupDense,
  RegistrationPriceGroup,
} from '../domain/priceGroup/types';
import { TEST_REGISTRATION_ID } from '../domain/registration/constants';
import {
  Registration,
  RegistrationsResponse,
} from '../domain/registration/types';
import { SeatsReservation } from '../domain/reserveSeats/types';
import {
  ATTENDEE_STATUS,
  NOTIFICATION_TYPE,
  PRESENCE_STATUS,
} from '../domain/signup/constants';
import {
  ContactPerson,
  Signup,
  SignupPayment,
  SignupPaymentCancellation,
  SignupPaymentRefund,
  SignupPriceGroup,
  SignupsResponse,
} from '../domain/signup/types';
import { SIGNUP_GROUP_INITIAL_VALUES } from '../domain/signupGroup/constants';
import {
  SignupGroup,
  SignupGroupFormFields,
} from '../domain/signupGroup/types';
import { User } from '../domain/user/types';

import generateAtId from './generateAtId';

export const fakeContactPerson = (
  overrides?: Partial<ContactPerson>
): ContactPerson => {
  const id = overrides?.id || faker.string.uuid();

  return merge<ContactPerson, typeof overrides>(
    {
      id,
      email: faker.internet.email(),
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      membership_number: faker.string.uuid(),
      native_language: 'fi',
      notifications: NOTIFICATION_TYPE.SMS_EMAIL,
      phone_number: null,
      service_language: 'fi',
    },
    overrides
  );
};

export const fakeEvent = (overrides?: Partial<Event>): Event => {
  const id = overrides?.id || faker.string.uuid();

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
      deleted: false,
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
      location_extra_info: fakeLocalisedObject(faker.location.streetAddress()),
      maximum_attendee_capacity: null,
      minimum_attendee_capacity: null,
      name: fakeLocalisedObject(faker.person.jobTitle()),
      offers: [],
      provider_contact_info: null,
      provider: fakeLocalisedObject(),
      publication_status: PublicationStatus.Public,
      publisher: faker.string.uuid(),
      short_description: fakeLocalisedObject(),
      start_time: '2020-07-13T05:51:05.761000Z',
      sub_events: [],
      super_event: null,
      super_event_type: null,
      type_id: EventTypeId.General,
      videos: [],
      '@id': generateAtId(id, 'event'),
      '@context': 'https://schema.org',
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
  const id = overrides?.id || faker.string.uuid();

  return merge<Image, typeof overrides>(
    {
      id,
      alt_text: faker.lorem.words(),
      created_time: null,
      cropping: '59,0,503,444',
      data_source: 'hel',
      last_modified_time: null,
      license: 'cc_by',
      name: faker.lorem.words(),
      photographer_name: faker.person.firstName(),
      publisher: faker.string.uuid(),
      url: faker.internet.url(),
      '@id': generateAtId(id, 'image'),
      '@context': 'https://schema.org',
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
  const id = overrides?.id || faker.string.uuid();

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
      publisher: faker.string.uuid(),
      '@id': generateAtId(id, 'keyword'),
      '@context': 'https://schema.org',
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
  const id = overrides?.id || faker.string.uuid();

  return merge<LELanguage, typeof overrides>(
    {
      id,
      translation_available: false,
      name: fakeLocalisedObject(),
      '@id': generateAtId(id, 'language'),
      '@context': 'https://schema.org',
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
  const id = overrides?.id || faker.string.uuid();

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
      postal_code: faker.location.zipCode(),
      post_office_box_num: null,
      publisher: 'hel:1234',
      replaced_by: null,
      street_address: fakeLocalisedObject(),
      telephone: fakeLocalisedObject(),
      has_upcoming_events: true,
      '@id': generateAtId(id, 'place'),
      '@context': 'https://schema.org',
      '@type': 'Place',
    },
    overrides
  );
};

export const fakeRegistrationPriceGroup = (
  overrides?: Partial<RegistrationPriceGroup>
): RegistrationPriceGroup => {
  const id = overrides?.id ?? faker.number.int();

  return merge<RegistrationPriceGroup, typeof overrides>(
    {
      id,
      price: faker.string.numeric(),
      price_group: fakePriceGroupDense(),
      price_without_vat: faker.string.numeric(),
      vat: faker.string.numeric(),
      vat_percentage: '24.00',
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
  const id = overrides?.id || faker.string.uuid();
  const event = fakeEvent();

  return merge<Registration, typeof overrides>(
    {
      id,
      attendee_registration: false,
      audience_max_age: null,
      audience_min_age: null,
      confirmation_message: fakeLocalisedObject(faker.lorem.paragraph()),
      created_by: faker.person.firstName(),
      created_time: null,
      current_attendee_count: 0,
      current_waiting_list_count: 0,
      enrolment_end_time: '2020-09-30T16:00:00.000000Z',
      enrolment_start_time: '2020-09-27T15:00:00.000000Z',
      event,
      has_registration_user_access: true,
      instructions: fakeLocalisedObject(faker.lorem.paragraph()),
      last_modified_by: '',
      last_modified_time: '2020-09-12T15:00:00.000000Z',
      mandatory_fields: [],
      maximum_attendee_capacity: null,
      maximum_group_size: null,
      minimum_attendee_capacity: null,
      publisher: event.publisher,
      registration_price_groups: [],
      remaining_attendee_capacity: null,
      remaining_waiting_list_capacity: null,
      signups: [],
      waiting_list_capacity: null,
    },
    overrides
  );
};

export const fakeSeatsReservation = (
  overrides?: Partial<SeatsReservation>
): SeatsReservation => {
  const id = overrides?.id || faker.string.uuid();

  const timestamp = new Date().toISOString();

  return merge<SeatsReservation, typeof overrides>(
    {
      id,
      code: faker.string.uuid(),
      expiration: addMinutes(new Date(timestamp), 30).toISOString(),
      in_waitlist: false,
      registration: TEST_REGISTRATION_ID,
      seats: 1,
      timestamp,
    },
    overrides
  );
};

export const fakeSignups = (
  count = 1,
  signups?: Partial<Signup>[]
): SignupsResponse => ({
  data: generateNodeArray((i) => fakeSignup(signups?.[i]), count),
  meta: fakeMeta(count),
});

export const fakeSignup = (overrides?: Partial<Signup>): Signup => {
  const id = overrides?.id || faker.string.uuid();

  return merge<Signup, typeof overrides>(
    {
      id,
      attendee_status: ATTENDEE_STATUS.Attending,
      city: faker.location.city(),
      contact_person: fakeContactPerson(),
      created_by: null,
      created_time: null,
      date_of_birth: '1990-10-10',
      extra_info: faker.lorem.paragraph(),
      first_name: faker.person.firstName(),
      has_contact_person_access: false,
      is_created_by_current_user: false,
      last_modified_by: null,
      last_modified_time: null,
      last_name: faker.person.lastName(),
      payment: null,
      payment_cancellation: null,
      payment_refund: null,
      phone_number: null,
      presence_status: PRESENCE_STATUS.NotPresent,
      price_group: null,
      registration: TEST_REGISTRATION_ID,
      signup_group: null,
      street_address: faker.location.streetAddress(),
      user_consent: false,
      zipcode: faker.location.zipCode('#####'),
    },
    overrides
  );
};

export const fakeSignupGroup = (
  overrides?: Partial<SignupGroup>
): SignupGroup => {
  const id = overrides?.id || faker.string.uuid();

  return merge<SignupGroup, typeof overrides>(
    {
      id,
      contact_person: fakeContactPerson(),
      created_by: null,
      created_time: null,
      extra_info: '',
      has_contact_person_access: false,
      is_created_by_current_user: false,
      last_modified_by: null,
      last_modified_time: null,
      payment: null,
      payment_cancellation: null,
      payment_refund: null,
      registration: TEST_REGISTRATION_ID,
      signups: [],
    },
    overrides
  );
};

export const fakeSignupPayment = (
  overrides?: Partial<SignupPayment>
): SignupPayment => {
  const id = overrides?.id || faker.number.int();
  const order_id = faker.string.uuid();

  return merge<SignupPayment, typeof overrides>(
    {
      id,
      amount: '12.00',
      checkout_url: 'https://payment.com',
      created_by: null,
      created_time: null,
      external_order_id: order_id,
      last_modified_by: null,
      last_modified_time: null,
      logged_in_checkout_url: 'https://payment.com',
      status: 'created',
    },
    overrides
  );
};

export const fakeSignupPaymentCancellation = (
  overrides?: Partial<SignupPaymentCancellation>
): SignupPaymentCancellation => {
  return merge<SignupPaymentCancellation, typeof overrides>(
    {
      created_time: '',
      id: faker.number.int(),
      payment: faker.number.int(),
    },
    overrides
  );
};

export const fakeSignupPaymentRefund = (
  overrides?: Partial<SignupPaymentRefund>
): SignupPaymentRefund => {
  return merge<SignupPaymentRefund, typeof overrides>(
    {
      amount: '1.00',
      created_time: '',
      external_refund_id: '1',
      id: faker.number.int(),
      payment: faker.number.int(),
    },
    overrides
  );
};

export const fakePriceGroupDense = (
  overrides?: Partial<PriceGroupDense>
): PriceGroupDense => {
  const id = overrides?.id ?? faker.number.int();

  return merge<PriceGroupDense, typeof overrides>(
    {
      id,
      description: fakeLocalisedObject(),
    },
    overrides
  );
};

export const fakeSignupPriceGroup = (
  overrides?: Partial<SignupPriceGroup>
): SignupPriceGroup => {
  const id = overrides?.id ?? faker.number.int();

  return merge<SignupPriceGroup, typeof overrides>(
    {
      id,
      price: faker.string.numeric(),
      price_group: fakePriceGroupDense(),
      price_without_vat: faker.string.numeric(),
      registration_price_group: faker.number.int(),
      vat: faker.string.numeric(),
      vat_percentage: '24.00',
    },
    overrides
  );
};

export const fakeUser = (overrides?: Partial<User>): User => {
  const uuid = overrides?.uuid || faker.string.uuid();
  return merge<User, typeof overrides>(
    {
      admin_organizations: [],
      date_joined: null,
      department_name: faker.lorem.words(),
      display_name: faker.lorem.words(),
      email: faker.internet.email(),
      first_name: faker.person.firstName(),
      is_external: false,
      is_staff: false,
      is_strongly_identified: true,
      last_login: '',
      last_name: faker.person.lastName(),
      organization: faker.lorem.words(),
      organization_memberships: [],
      username: faker.string.uuid(),
      uuid,
      '@id': generateAtId(uuid, 'user'),
      '@context': 'https://schema.org',
      '@type': 'User',
    },
    overrides
  );
};

export const fakeLocalisedObject = (text?: string): LocalisedObject => ({
  ar: faker.lorem.words(),
  en: faker.lorem.words(),
  fi: text || faker.lorem.words(),
  ru: faker.lorem.words(),
  sv: faker.lorem.words(),
  zh_hans: faker.lorem.words(),
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

export const setSignupGroupFormSessionStorageValues = ({
  registrationId,
  seatsReservation,
  signupGroupFormValues,
}: {
  registrationId: string;
  seatsReservation?: SeatsReservation;
  signupGroupFormValues?: Partial<SignupGroupFormFields>;
}) => {
  jest.spyOn(sessionStorage, 'getItem').mockImplementation((key: string) => {
    switch (key) {
      case `${FORM_NAMES.CREATE_SIGNUP_GROUP_FORM}-${registrationId}`:
        return JSON.stringify({
          errors: {},
          isSubmitting: false,
          isValidating: false,
          submitCount: 0,
          touched: {},
          values: {
            ...SIGNUP_GROUP_INITIAL_VALUES,
            ...signupGroupFormValues,
          },
        } as FormikState<SignupGroupFormFields>);
      case `${RESERVATION_NAMES.SIGNUP_RESERVATION}-${registrationId}`:
        return seatsReservation ? JSON.stringify(seatsReservation) : '';
      default:
        return '';
    }
  });
};

export const getMockedSeatsReservationData = (expirationOffset: number) => {
  const now = new Date();
  const expiration = addSeconds(now, expirationOffset).toISOString();

  return fakeSeatsReservation({ expiration });
};

export const setSessionStorageValues = (
  reservation: SeatsReservation,
  registration: Registration
) => {
  jest.spyOn(sessionStorage, 'getItem').mockImplementation((key: string) => {
    const reservationKey = `${RESERVATION_NAMES.SIGNUP_RESERVATION}-${registration.id}`;

    if (key === reservationKey) {
      return reservation ? JSON.stringify(reservation) : '';
    }
    return '';
  });
};
