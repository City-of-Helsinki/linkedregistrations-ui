import { Meta, stringOrNull } from '../api/types';

import {
  ATTENDEE_STATUS,
  NOTIFICATION_TYPE,
  PRESENCE_STATUS,
} from './constants';

export type SignupInput = {
  city?: stringOrNull;
  date_of_birth?: stringOrNull;
  email?: stringOrNull;
  extra_info?: stringOrNull;
  first_name?: stringOrNull;
  last_name?: stringOrNull;
  membership_number?: stringOrNull;
  native_language?: stringOrNull;
  notifications?: NOTIFICATION_TYPE;
  phone_number?: stringOrNull;
  responsible_for_group: boolean;
  service_language?: stringOrNull;
  street_address?: stringOrNull;
  zipcode?: stringOrNull;
};

export type Signup = {
  id: string;
  attendee_status?: ATTENDEE_STATUS;
  city?: stringOrNull;
  created_at: stringOrNull;
  created_by: stringOrNull;
  date_of_birth?: stringOrNull;
  email?: stringOrNull;
  extra_info?: stringOrNull;
  first_name?: stringOrNull;
  last_modified_at: stringOrNull;
  last_modified_by: stringOrNull;
  last_name?: stringOrNull;
  membership_number?: stringOrNull;
  native_language?: stringOrNull;
  notifications?: NOTIFICATION_TYPE;
  phone_number?: stringOrNull;
  presence_status?: PRESENCE_STATUS;
  registration: string;
  responsible_for_group: boolean;
  service_language?: stringOrNull;
  street_address?: stringOrNull;
  zipcode?: stringOrNull;
};

export type SignupsResponse = {
  data: Array<Signup>;
  meta: Meta;
};

export type DeleteSignupMutationInput = {
  registrationId: string;
  signupId: string;
};

export type UpdateSignupMutationInput = {
  id: string;
  city: string;
  date_of_birth: string;
  email: string;
  extra_info: string;
  first_name: string;
  last_name: string;
  membership_number: string;
  native_language: string;
  notifications: string;
  phone_number: string;
  presence_status: PRESENCE_STATUS;
  registration: string;
  responsible_for_group: boolean;
  service_language: string;
  street_address: string;
  zipcode: string;
};

export type PatchSignupMutationInput = {
  id: string;
} & Partial<UpdateSignupMutationInput>;

export type SignupQueryVariables = {
  id: string;
};
