export enum SUPPORTED_LANGUAGES {
  FI = 'fi',
  SV = 'sv',
  EN = 'en',
}

export const DEFAULT_LANGUAGE = SUPPORTED_LANGUAGES.FI;

export enum VALIDATION_MESSAGE_KEYS {
  AGE_MAX = 'validation.age.max',
  AGE_MIN = 'validation.age.min',
  ARRAY_MIN = 'validation.array.min',
  ARRAY_REQUIRED = 'validation.array.required',
  CAPACITY_MAX = 'validation.capacity.max',
  CAPACITY_MIN = 'validation.capacity.min',
  DATE = 'validation.string.date',
  EMAIL = 'validation.string.email',
  ENROLMENT_ACCEPTED = 'validation.enrolmentAccepted',
  PHONE = 'validation.string.phone',
  STRING_REQUIRED = 'validation.string.required',
  ZIP = 'validation.string.zip',
}

export const PAGE_HEADER_ID = 'page-header';
export const MAIN_CONTENT_ID = 'maincontent';

export const DATE_FORMAT = 'd.M.yyyy';

export enum RESERVATION_NAMES {
  ENROLMENT_RESERVATION = 'enrolment-reservation',
}

export enum FORM_NAMES {
  CREATE_ENROLMENT_FORM = 'create-enrolment-form',
}
