import { AxiosError } from 'axios';
import omit from 'lodash/omit';

import { ExtendedSession } from '../../types';
import formatDate from '../../utils/formatDate';
import skipFalsyType from '../../utils/skipFalsyType';
import stringToDate from '../../utils/stringToDate';
import {
  callDelete,
  callGet,
  callPatch,
  callPut,
} from '../app/axios/axiosClient';
import { Registration } from '../registration/types';
import { NOTIFICATIONS } from '../signupGroup/constants';
import {
  SignupFields,
  SignupFormFields,
  SignupGroupFormFields,
} from '../signupGroup/types';

import { ATTENDEE_STATUS, NOTIFICATION_TYPE } from './constants';
import {
  PatchSignupMutationInput,
  Signup,
  SignupInput,
  SignupQueryVariables,
  UpdateSignupMutationInput,
} from './types';

export const signupPathBuilder = (args: SignupQueryVariables): string => {
  return `/signup/${args.id}/`;
};

export const fetchSignup = async (
  args: SignupQueryVariables,
  session: ExtendedSession | null
): Promise<Signup> => {
  try {
    const { data } = await callGet({
      session,
      url: signupPathBuilder(args),
    });
    return data;
  } catch (error) {
    /* istanbul ignore next */
    throw Error(JSON.stringify((error as AxiosError).response?.data));
  }
};

export const deleteSignup = async ({
  id,
  session,
}: {
  id: string;
  session: ExtendedSession | null;
}): Promise<null> => {
  try {
    const { data } = await callDelete({
      session,
      url: signupPathBuilder({ id }),
    });
    return data;
  } catch (error) {
    throw Error(JSON.stringify((error as AxiosError).response?.data));
  }
};

export const patchSignup = async ({
  input: { id, ...input },
  session,
}: {
  input: PatchSignupMutationInput;
  session: ExtendedSession | null;
}): Promise<Signup> => {
  try {
    const { data } = await callPatch({
      data: JSON.stringify(input),
      session,
      url: signupPathBuilder({ id }),
    });
    return data;
  } catch (error) {
    throw Error(JSON.stringify((error as AxiosError).response?.data));
  }
};

export const updateSignup = async ({
  input: { id, ...input },
  session,
}: {
  input: UpdateSignupMutationInput;
  session: ExtendedSession | null;
}): Promise<Signup> => {
  try {
    const { data } = await callPut({
      data: JSON.stringify(input),
      session,
      url: signupPathBuilder({ id }),
    });
    return data;
  } catch (error) {
    throw Error(JSON.stringify((error as AxiosError).response?.data));
  }
};

export const getSignupInitialValues = (signup: Signup): SignupFormFields => ({
  city: signup.city ?? '',
  dateOfBirth: signup.date_of_birth
    ? formatDate(new Date(signup.date_of_birth))
    : '',
  extraInfo: signup.extra_info ?? '',
  firstName: signup.first_name ?? '',
  id: signup.id,
  inWaitingList: signup.attendee_status === ATTENDEE_STATUS.Waitlisted,
  lastName: signup.last_name ?? '',
  responsibleForGroup: !!signup.responsible_for_group,
  streetAddress: signup.street_address ?? '',
  zipcode: signup.zipcode ?? '',
});

export const getSignupGroupInitialValuesFromSignup = (
  signup: Signup
): SignupGroupFormFields => {
  return {
    accepted: true,
    email: signup.email ?? '',
    extraInfo: '',
    membershipNumber: signup.membership_number ?? '',
    nativeLanguage: signup.native_language ?? '',
    notifications: [NOTIFICATIONS.EMAIL],
    phoneNumber: signup.phone_number ?? '',
    serviceLanguage: signup.service_language ?? '',
    signups: [getSignupInitialValues(signup)],
  };
};

export const getSignupPayload = ({
  formValues,
  responsibleForGroup,
  signupData,
}: {
  formValues: SignupGroupFormFields;
  responsibleForGroup: boolean;
  signupData: SignupFormFields;
}): SignupInput => {
  const {
    email,
    membershipNumber,
    nativeLanguage,
    phoneNumber,
    serviceLanguage,
  } = formValues;

  const {
    city,
    dateOfBirth,
    extraInfo,
    firstName,
    id,
    lastName,
    streetAddress,
    zipcode,
  } = signupData;
  return {
    city: city || '',
    date_of_birth: dateOfBirth
      ? formatDate(stringToDate(dateOfBirth), 'yyyy-MM-dd')
      : null,
    email: email || null,
    extra_info: extraInfo || '',
    first_name: firstName || '',
    id: id ?? undefined,
    last_name: lastName || '',
    membership_number: membershipNumber,
    native_language: nativeLanguage || null,
    notifications: NOTIFICATION_TYPE.EMAIL,
    phone_number: phoneNumber || null,
    responsible_for_group: responsibleForGroup,
    service_language: serviceLanguage || null,
    street_address: streetAddress || null,
    zipcode: zipcode || null,
  };
};

export const getUpdateSignupPayload = ({
  formValues,
  id,
  registration,
}: {
  formValues: SignupGroupFormFields;
  id: string;
  registration: Registration;
}): UpdateSignupMutationInput => {
  const signupData = formValues.signups[0] ?? {};
  return {
    ...getSignupPayload({
      formValues,
      responsibleForGroup: !!signupData.responsibleForGroup,
      signupData,
    }),
    id,
    registration: registration.id,
  };
};

export const getSignupFields = ({
  signup,
}: {
  signup: Signup;
}): SignupFields => {
  const firstName = signup.first_name ?? '';
  const lastName = signup.last_name ?? '';
  const fullName = [firstName, lastName].filter(skipFalsyType).join(' ');

  return {
    firstName,
    fullName,
    lastName,
  };
};
export const omitSensitiveDataFromSignupPayload = (
  payload: SignupInput | UpdateSignupMutationInput
) =>
  omit(payload, [
    'city',
    'date_of_birth',
    'email',
    'extra_info',
    'first_name',
    'last_name',
    'membership_number',
    'native_language',
    'phone_number',
    'service_language',
    'street_address',
    'zipcode',
  ]);
