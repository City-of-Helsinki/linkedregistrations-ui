import { AxiosError } from 'axios';
import isEqual from 'lodash/isEqual';
import omit from 'lodash/omit';
import snakeCase from 'lodash/snakeCase';

import { FORM_NAMES } from '../../constants';
import { ExtendedSession } from '../../types';
import skipFalsyType from '../../utils/skipFalsyType';
import {
  callDelete,
  callGet,
  callPost,
  callPut,
} from '../app/axios/axiosClient';
import { Registration } from '../registration/types';
import { SeatsReservation } from '../reserveSeats/types';
import { ATTENDEE_STATUS, NOTIFICATION_TYPE } from '../signup/constants';
import {
  ContactPerson,
  ContactPersonInput,
  Signup,
  SignupInput,
} from '../signup/types';
import {
  getSignupInitialValues,
  getSignupPayload,
  omitSensitiveDataFromContactPerson,
  omitSensitiveDataFromSignupPayload,
} from '../signup/utils';

import {
  CONTACT_PERSON_FIELDS,
  NOTIFICATIONS,
  SIGNUP_FIELDS,
  SIGNUP_GROUP_FIELDS,
  SIGNUP_GROUP_INITIAL_VALUES,
  SIGNUP_INITIAL_VALUES,
} from './constants';
import {
  CreateSignupGroupMutationInput,
  CreateOrUpdateSignupGroupResponse,
  SignupFormFields,
  SignupGroup,
  SignupGroupFormFields,
  SignupGroupQueryVariables,
  UpdateSignupGroupMutationInput,
  ContactPersonFormFields,
  SignupPriceGroupOption,
} from './types';

export const getSignupNotificationsCode = (
  notifications: string[]
): NOTIFICATION_TYPE => {
  if (
    notifications.includes(NOTIFICATIONS.EMAIL) &&
    notifications.includes(NOTIFICATIONS.SMS)
  ) {
    return NOTIFICATION_TYPE.SMS_EMAIL;
  } else if (notifications.includes(NOTIFICATIONS.EMAIL)) {
    return NOTIFICATION_TYPE.EMAIL;
  } else if (notifications.includes(NOTIFICATIONS.SMS)) {
    return NOTIFICATION_TYPE.SMS;
  } else {
    return NOTIFICATION_TYPE.NO_NOTIFICATION;
  }
};

export const getSignupNotificationTypes = (
  notifications: string
): NOTIFICATIONS[] => {
  switch (notifications) {
    case NOTIFICATION_TYPE.SMS:
      return [NOTIFICATIONS.SMS];
    case NOTIFICATION_TYPE.EMAIL:
      return [NOTIFICATIONS.EMAIL];
    case NOTIFICATION_TYPE.SMS_EMAIL:
      return [NOTIFICATIONS.EMAIL, NOTIFICATIONS.SMS];
    default:
      return [];
  }
};

export const getContactPersonPayload = (
  formValues: ContactPersonFormFields
): ContactPersonInput => {
  const {
    email,
    firstName,
    id,
    lastName,
    membershipNumber,
    nativeLanguage,
    notifications,
    phoneNumber,
    serviceLanguage,
    ...rest
  } = formValues;

  return {
    ...rest,
    email: email || null,
    first_name: firstName,
    id: id || null,
    last_name: lastName,
    membership_number: membershipNumber,
    native_language: nativeLanguage || null,
    notifications: getSignupNotificationsCode(notifications),
    phone_number: phoneNumber || null,
    service_language: serviceLanguage || null,
  };
};

export const getSignupGroupPayload = ({
  formValues,
  registration,
  reservationCode,
}: {
  formValues: SignupGroupFormFields;
  registration: Registration;
  reservationCode: string;
}): CreateSignupGroupMutationInput => {
  const {
    contactPerson,
    extraInfo: groupExtraInfo,
    signups: signupsValues,
  } = formValues;

  const signups: SignupInput[] = signupsValues.map((signupData) =>
    getSignupPayload({
      formValues,
      signupData,
    })
  );

  return {
    contact_person: getContactPersonPayload(contactPerson),
    extra_info: groupExtraInfo,
    registration: registration.id,
    reservation_code: reservationCode,
    signups,
  };
};

export const getUpdateSignupGroupPayload = ({
  formValues,
  id,
  registration,
}: {
  formValues: SignupGroupFormFields;
  id: string;
  registration: Registration;
}): UpdateSignupGroupMutationInput => {
  const {
    contactPerson,
    extraInfo: groupExtraInfo,
    signups: signupsValues,
  } = formValues;

  const signups: SignupInput[] = signupsValues.map((signupData) =>
    getSignupPayload({
      formValues,
      signupData,
    })
  );

  return {
    contact_person: getContactPersonPayload(contactPerson),
    extra_info: groupExtraInfo,
    id,
    registration: registration.id,
    signups,
  };
};

export const getSignupDefaultInitialValues = (): SignupFormFields => ({
  ...SIGNUP_INITIAL_VALUES,
});

export const getSignupGroupDefaultInitialValues =
  (): SignupGroupFormFields => ({
    ...SIGNUP_GROUP_INITIAL_VALUES,
    signups: [getSignupDefaultInitialValues()],
  });

export const getContactPersonInitialValues = (
  contactPerson: Partial<ContactPerson>
): ContactPersonFormFields => ({
  email: contactPerson.email ?? '',
  firstName: contactPerson.first_name ?? '',
  id: contactPerson.id ?? null,
  lastName: contactPerson.last_name ?? '',
  membershipNumber: contactPerson.membership_number ?? '',
  nativeLanguage: contactPerson.native_language ?? '',
  notifications: [NOTIFICATIONS.EMAIL],
  phoneNumber: contactPerson.phone_number ?? '',
  serviceLanguage: contactPerson.service_language ?? '',
});

export const getSignupGroupInitialValues = (
  signupGroup: SignupGroup
): SignupGroupFormFields => {
  const signups: Signup[] = (
    signupGroup.signups ?? /* istanbul ignore next*/ []
  ).filter(skipFalsyType);

  return {
    contactPerson: getContactPersonInitialValues(
      signupGroup.contact_person ?? {}
    ),
    extraInfo: signupGroup.extra_info ?? '',
    signups: signups.map((su) => getSignupInitialValues(su)),
    userConsent: signups.every((su) => su.user_consent),
  };
};

export const clearCreateSignupGroupFormData = (
  registrationId: string
): void => {
  sessionStorage?.removeItem(
    `${FORM_NAMES.CREATE_SIGNUP_GROUP_FORM}-${registrationId}`
  );
};

export const getNewSignups = ({
  seatsReservation,
  signups,
}: {
  seatsReservation: SeatsReservation;
  signups: SignupFormFields[];
}) => {
  const { in_waitlist, seats } = seatsReservation;
  const signupInitialValues = getSignupDefaultInitialValues();
  const filledSignups = signups.filter((a) => !isEqual(a, signupInitialValues));
  return [
    ...filledSignups,
    ...Array(Math.max(seats - filledSignups.length, 0)).fill(
      signupInitialValues
    ),
  ]
    .slice(0, seats)
    .map((signup) => ({ ...signup, inWaitingList: in_waitlist }));
};

export const isSignupFieldRequired = (
  registration: Registration,
  fieldId: CONTACT_PERSON_FIELDS | SIGNUP_FIELDS | SIGNUP_GROUP_FIELDS
): boolean => registration.mandatory_fields.includes(snakeCase(fieldId));

export const isAnySignupInWaitingList = (signupGroup: SignupGroup): boolean =>
  Boolean(
    signupGroup.signups.find(
      (su) => su.attendee_status === ATTENDEE_STATUS.Waitlisted
    )
  );

export const isDateOfBirthFieldRequired = (
  registration: Registration
): boolean =>
  Boolean(registration.audience_max_age || registration.audience_min_age);

export const signupGroupPathBuilder = (
  args: SignupGroupQueryVariables
): string => {
  return `/signup_group/${args.id}/`;
};

export const createSignupGroup = async ({
  input,
  session,
}: {
  input: CreateSignupGroupMutationInput;
  session: ExtendedSession | null;
}): Promise<CreateOrUpdateSignupGroupResponse> => {
  try {
    const { data } = await callPost({
      data: JSON.stringify(input),
      session,
      url: `/signup_group/`,
    });
    return data;
  } catch (error) {
    throw Error(JSON.stringify((error as AxiosError).response?.data));
  }
};

export const fetchSignupGroup = async (
  args: SignupGroupQueryVariables,
  session: ExtendedSession | null
): Promise<SignupGroup> => {
  try {
    const { data } = await callGet({
      session,
      url: signupGroupPathBuilder(args),
    });
    return data;
  } catch (error) {
    /* istanbul ignore next */
    throw Error(JSON.stringify((error as AxiosError).response?.data));
  }
};

export const deleteSignupGroup = async ({
  id,
  session,
}: {
  id: string;
  session: ExtendedSession | null;
}): Promise<null> => {
  try {
    const { data } = await callDelete({
      session,
      url: signupGroupPathBuilder({ id }),
    });
    return data;
  } catch (error) {
    throw Error(JSON.stringify((error as AxiosError).response?.data));
  }
};

export const updateSignupGroup = async ({
  input: { id, ...input },
  session,
}: {
  input: UpdateSignupGroupMutationInput;
  session: ExtendedSession | null;
}): Promise<CreateOrUpdateSignupGroupResponse> => {
  try {
    const { data } = await callPut({
      data: JSON.stringify(input),
      session,
      url: signupGroupPathBuilder({ id }),
    });
    return data;
  } catch (error) {
    throw Error(JSON.stringify((error as AxiosError).response?.data));
  }
};

export const omitSensitiveDataFromSignupGroupPayload = (
  payload: CreateSignupGroupMutationInput | UpdateSignupGroupMutationInput
): Partial<CreateSignupGroupMutationInput> => ({
  ...omit(payload, ['extra_info']),
  contact_person: payload.contact_person
    ? (omitSensitiveDataFromContactPerson(
        payload.contact_person
      ) as ContactPersonInput)
    : payload.contact_person,
  signups: payload.signups.map((s) =>
    omitSensitiveDataFromSignupPayload(s)
  ) as SignupInput[],
});

export const getContactPersonFieldName = (name: string) =>
  `${SIGNUP_GROUP_FIELDS.CONTACT_PERSON}.${name}`;

export const calculateTotalPrice = (
  priceGroupOptions: SignupPriceGroupOption[],
  signups: SignupFormFields[]
) =>
  signups.reduce(
    (prev, curr) =>
      prev +
      (priceGroupOptions.find((o) => o.value === curr.priceGroup)?.price ?? 0),
    0
  );
