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
  PHONE = 'validation.string.phone',
  SIGNUP_USER_CONSENT = 'validation.signupUserConsent',
  STRING_MAX = 'validation.string.max',
  STRING_REQUIRED = 'validation.string.required',
  ZIP = 'validation.string.zip',
}

export const PAGE_HEADER_ID = 'page-header';
export const MAIN_CONTENT_ID = 'maincontent';

export const DATE_FORMAT = 'd.M.yyyy';
export const TIME_FORMAT = 'HH.mm';

export enum RESERVATION_NAMES {
  SIGNUP_RESERVATION = 'signup-reservation',
}

export enum FORM_NAMES {
  CREATE_SIGNUP_GROUP_FORM = 'create-signup-group-form',
}

export const READ_ONLY_PLACEHOLDER = '-';

export const SIGNOUT_REDIRECT = '/signout';

export enum SPLITTED_ROW_TYPE {
  MEDIUM_MEDIUM = 'medium-medium',
  LARGE_SMALL = 'large-small',
  SMALL_LARGE = 'small-large',
}

export const DEFAULT_SPLITTED_ROW_TYPE = SPLITTED_ROW_TYPE.MEDIUM_MEDIUM;

export type LoginMethod = "helsinki_tunnus" | "suomi_fi" | "helsinkiad";

export const parseLoginMethods = (value: string): LoginMethod[] => {
  const validMethods: LoginMethod[] = ["helsinki_tunnus", "suomi_fi", "helsinkiad"];

  return value.split(',').map(i => {
    const trimmed = i.trim();
    if (!validMethods.includes(trimmed as LoginMethod)) {
      throw new Error(`Invalid login method: ${trimmed}`);
    }
    return trimmed as LoginMethod;
  })
}