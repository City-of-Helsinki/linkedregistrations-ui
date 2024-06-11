import { OptionType } from '../../types';
import { stringOrNull } from '../api/types';
import { ATTENDEE_STATUS } from '../signup/constants';
import {
  ContactPerson,
  ContactPersonInput,
  Signup,
  SignupInput,
  SignupPayment,
  SignupPaymentCancellation,
  SignupPaymentRefund,
} from '../signup/types';

import {
  CONTACT_PERSON_FIELDS,
  SIGNUP_FIELDS,
  SIGNUP_GROUP_FIELDS,
} from './constants';

export type CreateSignupGroupMutationInput = {
  contact_person?: ContactPersonInput;
  create_payment?: boolean;
  extra_info: string;
  registration: string;
  reservation_code: string;
  signups: SignupInput[];
};

export type SignupGroupQueryVariables = {
  accessCode?: string;
  id: string;
};

export type DeleteSignupGroupMutationInput = Omit<
  SignupGroupQueryVariables,
  'accessCode'
>;

export type UpdateSignupGroupMutationInput = Omit<
  SignupGroupQueryVariables,
  'accessCode'
> &
  Omit<CreateSignupGroupMutationInput, 'reservation_code'>;

export type CreateOrUpdateSignupGroupResponse = {
  extra_info: string;
  id: string;
  payment: SignupPayment | null;
  registration: string;
  signups: Signup[];
};

export type SignupGroup = {
  contact_person?: ContactPerson;
  created_by: stringOrNull;
  created_time: stringOrNull;
  extra_info: stringOrNull;
  has_contact_person_access: boolean;
  id: string;
  is_created_by_current_user: boolean;
  last_modified_by: stringOrNull;
  last_modified_time: stringOrNull;
  payment: SignupPayment | null;
  payment_cancellation: SignupPaymentCancellation | null;
  payment_refund: SignupPaymentRefund | null;
  registration: string;
  signups: Signup[];
};

export type ContactPersonFormFields = {
  [CONTACT_PERSON_FIELDS.EMAIL]: string;
  [CONTACT_PERSON_FIELDS.FIRST_NAME]: string;
  [CONTACT_PERSON_FIELDS.ID]: string | null;
  [CONTACT_PERSON_FIELDS.LAST_NAME]: string;
  [CONTACT_PERSON_FIELDS.MEMBERSHIP_NUMBER]: string;
  [CONTACT_PERSON_FIELDS.NATIVE_LANGUAGE]: string;
  [CONTACT_PERSON_FIELDS.NOTIFICATIONS]: string[];
  [CONTACT_PERSON_FIELDS.PHONE_NUMBER]: string;
  [CONTACT_PERSON_FIELDS.SERVICE_LANGUAGE]: string;
};

export type SignupFormFields = {
  [SIGNUP_FIELDS.CITY]: string;
  [SIGNUP_FIELDS.DATE_OF_BIRTH]: string;
  [SIGNUP_FIELDS.EXTRA_INFO]: string;
  [SIGNUP_FIELDS.FIRST_NAME]: string;
  [SIGNUP_FIELDS.ID]: string | null;
  [SIGNUP_FIELDS.IN_WAITING_LIST]: boolean;
  [SIGNUP_FIELDS.LAST_NAME]: string;
  [SIGNUP_FIELDS.PHONE_NUMBER]: string;
  [SIGNUP_FIELDS.PRICE_GROUP]: string;
  [SIGNUP_FIELDS.STREET_ADDRESS]: string;
  [SIGNUP_FIELDS.ZIPCODE]: string;
};

export type SignupGroupFormFields = {
  [SIGNUP_GROUP_FIELDS.CONTACT_PERSON]: ContactPersonFormFields;
  [SIGNUP_GROUP_FIELDS.EXTRA_INFO]: string;
  [SIGNUP_GROUP_FIELDS.SIGNUPS]: SignupFormFields[];
  [SIGNUP_GROUP_FIELDS.USER_CONSENT]: boolean;
};

export type SignupFields = {
  attendeeStatus: ATTENDEE_STATUS;
  contactPersonEmail: string;
  contactPersonPhoneNumber: string;
  firstName: string;
  fullName: string;
  lastName: string;
  phoneNumber: string;
  signupGroup: string | null;
};

export type SignupPriceGroupOption = OptionType & { price: number };
