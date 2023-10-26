import { IconCheck, IconEye } from 'hds-react';

export enum REGISTRATION_MANDATORY_FIELDS {
  CITY = 'city',
  FIRST_NAME = 'first_name',
  LAST_NAME = 'last_name',
  PHONE_NUMBER = 'phone_number',
  STREET_ADDRESS = 'street_address',
  ZIPCODE = 'zipcode',
}

export const TEST_REGISTRATION_ID = 'registration:1';

export const REGISTRATION_INCLUDES = ['event', 'keywords', 'location'];

export enum REGISTRATION_ACTIONS {
  VIEW_ATTENDANCE_LIST = 'viewAttendanceList',
  VIEW_SIGNUPS = 'viewSignups',
}

export const REGISTRATION_ICONS = {
  [REGISTRATION_ACTIONS.VIEW_ATTENDANCE_LIST]: <IconCheck aria-hidden={true} />,
  [REGISTRATION_ACTIONS.VIEW_SIGNUPS]: <IconEye aria-hidden={true} />,
};

export const REGISTRATION_LABEL_KEYS = {
  [REGISTRATION_ACTIONS.VIEW_ATTENDANCE_LIST]:
    'common:actions.viewAttendanceList',
  [REGISTRATION_ACTIONS.VIEW_SIGNUPS]: 'common:actions.viewSignups',
};
