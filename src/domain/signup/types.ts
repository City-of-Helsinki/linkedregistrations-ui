import { stringOrNull } from '../api/types';

import { ATTENDEE_STATUS, NOTIFICATION_TYPE } from './constants';

export type SignupInput = {
  city?: stringOrNull;
  date_of_birth?: stringOrNull;
  email?: stringOrNull;
  extra_info?: stringOrNull;
  first_name?: stringOrNull;
  id?: stringOrNull;
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

export type UpdateSignupMutationInput = {
  id: string;
  registration: string;
} & SignupInput;

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
  registration: string;
  responsible_for_group: boolean;
  service_language?: stringOrNull;
  street_address?: stringOrNull;
  zipcode?: stringOrNull;
};

export type DeleteSignupMutationInput = {
  registrationId: string;
  signupId: string;
};

export type SignupQueryVariables = {
  id: string;
};
