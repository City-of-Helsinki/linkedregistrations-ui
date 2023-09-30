import { AxiosError } from 'axios';
import isEqual from 'lodash/isEqual';
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
import { NOTIFICATION_TYPE } from '../signup/constants';
import { Signup, SignupInput } from '../signup/types';
import { getSignupInitialValues, getSignupPayload } from '../signup/utils';

import {
  NOTIFICATIONS,
  SIGNUP_FIELDS,
  SIGNUP_GROUP_FIELDS,
  SIGNUP_GROUP_INITIAL_VALUES,
  SIGNUP_INITIAL_VALUES,
} from './constants';
import {
  CreateSignupGroupMutationInput,
  CreateSignupGroupResponse,
  SignupFields,
  SignupGroup,
  SignupGroupFormFields,
  SignupGroupQueryVariables,
  UpdateSignupGroupMutationInput,
  UpdateSignupGroupResponse,
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

export const getSignupGroupPayload = ({
  formValues,
  registration,
  reservationCode,
}: {
  formValues: SignupGroupFormFields;
  registration: Registration;
  reservationCode: string;
}): CreateSignupGroupMutationInput => {
  const { extraInfo: groupExtraInfo, signups: signupsValues } = formValues;

  const signups: SignupInput[] = signupsValues.map((signupData, index) =>
    getSignupPayload({
      formValues,
      responsibleForGroup: index === 0,
      signupData,
    })
  );

  return {
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
  const { extraInfo: groupExtraInfo, signups: signupsValues } = formValues;

  const signups: SignupInput[] = signupsValues.map((signupData) =>
    getSignupPayload({
      formValues,
      responsibleForGroup: signupData.responsibleForGroup,
      signupData,
    })
  );

  return {
    extra_info: groupExtraInfo,
    id,
    registration: registration.id,
    signups,
  };
};

export const getSignupDefaultInitialValues = (): SignupFields => ({
  ...SIGNUP_INITIAL_VALUES,
});

export const getSignupGroupDefaultInitialValues =
  (): SignupGroupFormFields => ({
    ...SIGNUP_GROUP_INITIAL_VALUES,
    signups: [getSignupDefaultInitialValues()],
  });

export const getSignupGroupInitialValues = (
  signupGroup: SignupGroup
): SignupGroupFormFields => {
  const signups: Signup[] = (
    signupGroup.signups ?? /* istanbul ignore next*/ []
  )
    .filter(skipFalsyType)
    .sort((a: Signup, b: Signup) => {
      if (a.responsible_for_group === b.responsible_for_group) {
        return 0;
      }
      return a.responsible_for_group === true ? -1 : 1;
    });

  const responsibleSignup = signups[0];

  return {
    accepted: true,
    email: responsibleSignup?.email ?? '',
    extraInfo: signupGroup.extra_info ?? '',
    membershipNumber: responsibleSignup?.membership_number ?? '',
    nativeLanguage: responsibleSignup?.native_language ?? '',
    notifications: [NOTIFICATIONS.EMAIL],
    phoneNumber: responsibleSignup?.phone_number ?? '',
    serviceLanguage: responsibleSignup?.service_language ?? '',
    signups: signups.map((su) => getSignupInitialValues(su)),
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
  signups: SignupFields[];
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
  fieldId: SIGNUP_FIELDS | SIGNUP_GROUP_FIELDS
): boolean => registration.mandatory_fields.includes(snakeCase(fieldId));

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
}): Promise<CreateSignupGroupResponse> => {
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
}): Promise<UpdateSignupGroupResponse> => {
  try {
    const { data } = await callPut({
      data: JSON.stringify(input),
      session,
      url: signupGroupPathBuilder({ id: id as string }),
    });
    return data;
  } catch (error) {
    throw Error(JSON.stringify((error as AxiosError).response?.data));
  }
};
