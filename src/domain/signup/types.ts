import { Meta, stringOrNull } from '../api/types';
import { PriceGroupDense } from '../priceGroup/types';

import {
  ATTENDEE_STATUS,
  NOTIFICATION_TYPE,
  PRESENCE_STATUS,
} from './constants';

export type ContactPersonInput = {
  email: stringOrNull;
  first_name: stringOrNull;
  id: stringOrNull;
  last_name: stringOrNull;
  membership_number: stringOrNull;
  native_language: stringOrNull;
  notifications: NOTIFICATION_TYPE;
  phone_number: stringOrNull;
  service_language: stringOrNull;
};

export type SignupPriceGroupInput = {
  registration_price_group: number;
};

export type SignupInput = {
  city?: stringOrNull;
  contact_person?: ContactPersonInput;
  create_payment?: boolean;
  date_of_birth?: stringOrNull;
  extra_info?: stringOrNull;
  first_name?: stringOrNull;
  id?: stringOrNull;
  last_name?: stringOrNull;
  phone_number: stringOrNull;
  presence_status?: PRESENCE_STATUS;
  price_group?: SignupPriceGroupInput;
  street_address?: stringOrNull;
  user_consent: boolean;
  zipcode?: stringOrNull;
};

export type ContactPerson = {
  email?: stringOrNull;
  first_name?: stringOrNull;
  id: string;
  last_name?: stringOrNull;
  membership_number?: stringOrNull;
  native_language?: stringOrNull;
  notifications?: stringOrNull;
  phone_number?: stringOrNull;
  service_language?: stringOrNull;
};

export type SignupPayment = {
  amount: string;
  checkout_url: string;
  created_by?: stringOrNull;
  created_time: stringOrNull;
  external_order_id: string;
  id: number;
  last_modified_by?: stringOrNull;
  last_modified_time: stringOrNull;
  logged_in_checkout_url: string;
  status: string;
};

export type SignupPriceGroup = {
  id: number;
  price_group: PriceGroupDense;
  price: string;
  registration_price_group: number;
  vat_percentage: string;
  price_without_vat: string;
  vat: string;
};

export type Signup = {
  id: string;
  attendee_status?: ATTENDEE_STATUS;
  city?: stringOrNull;
  contact_person?: ContactPerson | null;
  created_by: stringOrNull;
  created_time: stringOrNull;
  date_of_birth?: stringOrNull;
  extra_info?: stringOrNull;
  first_name?: stringOrNull;
  has_contact_person_access: boolean;
  is_created_by_current_user: boolean;
  last_modified_by: stringOrNull;
  last_modified_time: stringOrNull;
  last_name?: stringOrNull;
  payment: SignupPayment | null;
  phone_number: stringOrNull;
  presence_status?: PRESENCE_STATUS;
  price_group: SignupPriceGroup | null;
  registration: string;
  signup_group: stringOrNull;
  street_address?: stringOrNull;
  user_consent?: boolean;
  zipcode?: stringOrNull;
};

export type SignupsResponse = {
  data: Array<Signup>;
  meta: Meta;
};

export type CreateSignupsResponse = Signup[];

export type CreateSignupsMutationInput = {
  registration: string;
  reservation_code: string;
  signups: SignupInput[];
};

export type SignupQueryVariables = {
  accessCode?: string;
  id: string;
};

export type DeleteSignupMutationInput = Omit<
  SignupQueryVariables,
  'accessCode'
>;

export type UpdateSignupMutationInput = Omit<
  SignupQueryVariables,
  'accessCode'
> & {
  registration: string;
} & SignupInput;

export type PatchSignupMutationInput = Omit<
  SignupQueryVariables,
  'accessCode'
> &
  Partial<UpdateSignupMutationInput>;
