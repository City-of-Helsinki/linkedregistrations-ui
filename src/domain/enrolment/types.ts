import { stringOrNull } from '../api/types';
import {
  ATTENDEE_FIELDS,
  ATTENDEE_STATUS,
  ENROLMENT_FIELDS,
  NOTIFICATION_TYPE,
} from './constants';

export type AttendeeFields = {
  [ATTENDEE_FIELDS.AUDIENCE_MAX_AGE]: number | null;
  [ATTENDEE_FIELDS.AUDIENCE_MIN_AGE]: number | null;
  [ATTENDEE_FIELDS.CITY]: string;
  [ATTENDEE_FIELDS.DATE_OF_BIRTH]: string;
  [ATTENDEE_FIELDS.EXTRA_INFO]: string;
  [ATTENDEE_FIELDS.NAME]: string;
  [ATTENDEE_FIELDS.STREET_ADDRESS]: string;
  [ATTENDEE_FIELDS.ZIP]: string;
};

export type EnrolmentFormFields = {
  [ENROLMENT_FIELDS.ACCEPTED]: boolean;
  [ENROLMENT_FIELDS.ATTENDEES]: AttendeeFields[];
  [ENROLMENT_FIELDS.EMAIL]: string;
  [ENROLMENT_FIELDS.EXTRA_INFO]: string;
  [ENROLMENT_FIELDS.MEMBERSHIP_NUMBER]: string;
  [ENROLMENT_FIELDS.NATIVE_LANGUAGE]: string;
  [ENROLMENT_FIELDS.NOTIFICATIONS]: string[];
  [ENROLMENT_FIELDS.PHONE_NUMBER]: string;
  [ENROLMENT_FIELDS.SERVICE_LANGUAGE]: string;
};

export type CreateEnrolmentMutationInput = {
  city?: stringOrNull;
  date_of_birth?: stringOrNull;
  email?: stringOrNull;
  extra_info?: stringOrNull;
  membership_number?: stringOrNull;
  name?: stringOrNull;
  native_language?: stringOrNull;
  notifications?: NOTIFICATION_TYPE;
  phone_number?: stringOrNull;
  registration: string;
  service_language?: stringOrNull;
  street_address?: stringOrNull;
  zipcode?: stringOrNull;
};

export type Enrolment = {
  id: string;
  attendee_status?: ATTENDEE_STATUS;
  cancellation_code?: string;
  city?: stringOrNull;
  date_of_birth?: stringOrNull;
  email?: stringOrNull;
  extra_info?: stringOrNull;
  membership_number?: stringOrNull;
  name?: stringOrNull;
  native_language?: stringOrNull;
  notifications?: NOTIFICATION_TYPE;
  phone_number?: stringOrNull;
  registration: string;
  service_language?: stringOrNull;
  street_address?: stringOrNull;
  zipcode?: stringOrNull;
};

export type EnrolmentQueryVariables = {
  cancellationCode: string;
};

export type EnrolmentReservation = {
  expires: number;
  participants: number;
  started: number;
  session: string;
};
