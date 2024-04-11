export enum ATTENDEE_STATUS {
  Attending = 'attending',
  Waitlisted = 'waitlisted',
}

export enum PRESENCE_STATUS {
  NotPresent = 'not_present',
  Present = 'present',
}

export enum NOTIFICATION_TYPE {
  NO_NOTIFICATION = 'none',
  SMS = 'sms',
  EMAIL = 'email',
  SMS_EMAIL = 'sms and email',
}

export const TEST_CONTACT_PERSON_ID = 'contact:0';
export const TEST_SIGNUP_ID = 'signup:1';

export enum SIGNUP_ACTIONS {
  CREATE = 'create',
  DELETE = 'delete',
  UPDATE = 'update',
}

export enum SIGNUP_MODALS {
  DELETE = 'delete',
  DELETE_SIGNUP_FROM_FORM = 'deleteSignupFromForm',
  PERSONS_ADDED_TO_WAITLIST = 'personsAddedToWaitList',
  RESERVATION_TIME_EXPIRED = 'reservationTimeExpired',
  RESERVATION_TIME_EXPIRING = 'reservationTimeExpiring',
}

export enum SIGNUP_QUERY_PARAMS {
  IFRAME = 'iframe',
  REDIRECT_URL = 'redirect_url',
}
