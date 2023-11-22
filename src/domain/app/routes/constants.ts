export enum ROUTES {
  ATTENDANCE_LIST = '/registration/[registrationId]/attendance-list',
  CALLBACK = '/api/auth/callback/tunnistamo',
  CREATE_SIGNUP_GROUP = '/registration/[registrationId]/signup-group/create',
  CREATE_SIGNUP_GROUP_SUMMARY = '/registration/[registrationId]/signup-group/create/summary',
  EDIT_SIGNUP = '/registration/[registrationId]/signup/[signupId]/edit',
  EDIT_SIGNUP_GROUP = '/registration/[registrationId]/signup-group/[signupGroupId]/edit',
  HOME = '/',
  SIGNUP_CANCELLED = '/registration/[registrationId]/signup/cancelled',
  SIGNUP_COMPLETED = '/registration/[registrationId]/signup/[signupId]/completed',
  SIGNUP_GROUP_CANCELLED = '/registration/[registrationId]/signup-group/cancelled',
  SIGNUP_GROUP_COMPLETED = '/registration/[registrationId]/signup-group/[signupGroupId]/completed',
  SIGNUPS = '/registration/[registrationId]/signup',
}
