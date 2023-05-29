import { Meta, numberOrNull, stringOrNull } from '../api/types';
import { Event } from '../event/types';

export type Registration = {
  id: string;
  attendee_registration: boolean;
  audience_max_age: numberOrNull;
  audience_min_age: numberOrNull;
  confirmation_message: string;
  created_at: stringOrNull;
  created_by: stringOrNull;
  current_attendee_count: number;
  current_waiting_list_count: number;
  enrolment_end_time: string;
  enrolment_start_time: string;
  event: Event;
  instructions: stringOrNull;
  last_modified_at: stringOrNull;
  last_modified_by: stringOrNull;
  mandatory_fields: string[];
  maximum_attendee_capacity: numberOrNull;
  minimum_attendee_capacity: numberOrNull;
  publisher: string;
  remaining_attendee_capacity: numberOrNull;
  remaining_waiting_list_capacity: numberOrNull;
  waiting_list_capacity: numberOrNull;
};

export type RegistrationsResponse = {
  data: Registration[];
  meta: Meta;
};

export type RegistrationQueryVariables = {
  id: string;
  include?: string[];
};

export type RegistrationFields = {
  audienceMaxAge: numberOrNull;
  audienceMinAge: numberOrNull;
  confirmationMessage: string;
  mandatoryFields: string[];
};
