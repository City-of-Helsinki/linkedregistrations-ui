import { AxiosError } from 'axios';

import { ExtendedSession } from '../../types';
import formatDate from '../../utils/formatDate';
import skipFalsyType from '../../utils/skipFalsyType';
import { callDelete, callGet, callPatch } from '../app/axios/axiosClient';
import { NOTIFICATIONS } from '../signupGroup/constants';
import {
  SignupFields,
  SignupFormFields,
  SignupGroupFormFields,
} from '../signupGroup/types';

import { ATTENDEE_STATUS } from './constants';
import {
  PatchSignupMutationInput,
  Signup,
  SignupQueryVariables,
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
