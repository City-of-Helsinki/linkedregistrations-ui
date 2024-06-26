import { AxiosError } from 'axios';
import { TFunction } from 'i18next';
import omit from 'lodash/omit';

import { ExtendedSession } from '../../types';
import { featureFlagUtils } from '../../utils/featureFlags';
import formatDate from '../../utils/formatDate';
import queryBuilder from '../../utils/queryBuilder';
import skipFalsyType from '../../utils/skipFalsyType';
import stringToDate from '../../utils/stringToDate';
import {
  callDelete,
  callGet,
  callPatch,
  callPost,
  callPut,
} from '../app/axios/axiosClient';
import { Event } from '../event/types';
import { isEventStarted } from '../event/utils';
import { Registration } from '../registration/types';
import {
  DeleteSignupGroupMutationInput,
  SignupFields,
  SignupFormFields,
  SignupGroup,
  SignupGroupFormFields,
} from '../signupGroup/types';
import {
  getContactPersonInitialValues,
  getContactPersonPayload,
  getSignupPriceGroupOptions,
  shouldCreatePayment,
} from '../signupGroup/utils';

import { ATTENDEE_STATUS } from './constants';
import {
  ContactPersonInput,
  CreateSignupsMutationInput,
  CreateSignupsResponse,
  PatchSignupMutationInput,
  Signup,
  SignupInput,
  SignupQueryVariables,
  UpdateSignupMutationInput,
} from './types';

export const signupPathBuilder = (args: SignupQueryVariables): string => {
  const { accessCode, id } = args;
  const variableToKeyItems = [{ key: 'access_code', value: accessCode }];

  const query = queryBuilder(variableToKeyItems);
  return `/signup/${id}/${query}`;
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

export const createSignups = async ({
  input,
  session,
}: {
  input: CreateSignupsMutationInput;
  session: ExtendedSession | null;
}): Promise<CreateSignupsResponse> => {
  try {
    const { data } = await callPost({
      data: JSON.stringify(input),
      session,
      url: '/signup/',
    });
    return data;
  } catch (error) {
    throw Error(JSON.stringify((error as AxiosError).response?.data));
  }
};

export const deleteSignup = async ({
  input,
  session,
}: {
  input: DeleteSignupGroupMutationInput;
  session: ExtendedSession | null;
}): Promise<null> => {
  try {
    const { data } = await callDelete({
      session,
      url: signupPathBuilder(input),
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
  phoneNumber: signup.phone_number ?? '',
  priceGroup: signup.price_group?.registration_price_group.toString() ?? '',
  streetAddress: signup.street_address ?? '',
  zipcode: signup.zipcode ?? '',
});

export const getSignupGroupInitialValuesFromSignup = (
  signup: Signup,
  signupGroup?: SignupGroup
): SignupGroupFormFields => {
  /* istanbul ignore next */
  const contactPerson =
    signupGroup?.contact_person ?? signup?.contact_person ?? {};
  return {
    contactPerson: getContactPersonInitialValues(contactPerson),
    extraInfo: '',
    signups: [getSignupInitialValues(signup)],
    userConsent: !!signup.user_consent,
  };
};

export const getSignupPayload = ({
  formValues,
  signupData,
}: {
  formValues: SignupGroupFormFields;
  signupData: SignupFormFields;
}): SignupInput => {
  const { userConsent } = formValues;

  const {
    city,
    dateOfBirth,
    extraInfo,
    firstName,
    id,
    lastName,
    phoneNumber,
    priceGroup,
    streetAddress,
    zipcode,
  } = signupData;
  return {
    city: city || '',
    date_of_birth: dateOfBirth
      ? formatDate(stringToDate(dateOfBirth), 'yyyy-MM-dd')
      : null,
    extra_info: extraInfo || '',
    first_name: firstName || '',
    id: id ?? undefined,
    last_name: lastName || '',
    phone_number: phoneNumber || '',
    ...(featureFlagUtils.isFeatureEnabled('WEB_STORE_INTEGRATION')
      ? {
          price_group: priceGroup
            ? { registration_price_group: Number(priceGroup) }
            : undefined,
        }
      : /* istanbul ignore next */
        {}),
    street_address: streetAddress || null,
    zipcode: zipcode || null,
    user_consent: userConsent,
  };
};

export const getUpdateSignupPayload = ({
  formValues,
  hasSignupGroup,
  id,
  registration,
}: {
  formValues: SignupGroupFormFields;
  hasSignupGroup: boolean;
  id: string;
  registration: Registration;
}): UpdateSignupMutationInput => {
  const { contactPerson } = formValues;
  const signupData = formValues.signups[0] ?? {};
  return {
    ...getSignupPayload({
      formValues,
      signupData,
    }),
    contact_person: !hasSignupGroup
      ? getContactPersonPayload(contactPerson)
      : undefined,
    id,
    registration: registration.id,
  };
};

export const getCreateSignupsPayload = ({
  formValues,
  registration,
  reservationCode,
}: {
  formValues: SignupGroupFormFields;
  registration: Registration;
  reservationCode: string;
}): CreateSignupsMutationInput => {
  const { contactPerson, signups: signupsValues } = formValues;
  const priceGroupOptions = getSignupPriceGroupOptions(registration, 'fi');
  const createPayment = shouldCreatePayment(priceGroupOptions, signupsValues);

  const signups: SignupInput[] = signupsValues.map((signupData) => ({
    ...getSignupPayload({
      formValues,
      signupData,
    }),
    ...(featureFlagUtils.isFeatureEnabled('WEB_STORE_INTEGRATION') &&
    createPayment
      ? { create_payment: createPayment }
      : {}),
    contact_person: getContactPersonPayload(contactPerson),
  }));

  return {
    registration: registration.id,
    reservation_code: reservationCode,
    signups,
  };
};

export const getSignupFields = ({
  signup,
}: {
  signup: Signup;
}): SignupFields => {
  const signupGroup = signup.signup_group ?? null;
  const firstName = signup.first_name ?? '';
  const lastName = signup.last_name ?? '';
  const fullName = [firstName, lastName].filter(skipFalsyType).join(' ');

  return {
    attendeeStatus: signup.attendee_status ?? ATTENDEE_STATUS.Attending,
    contactPersonEmail: signup.contact_person?.email ?? '',
    contactPersonPhoneNumber: signup.contact_person?.phone_number ?? '',
    firstName,
    fullName,
    lastName,
    phoneNumber: signup.phone_number ?? '',
    signupGroup,
  };
};

export const omitSensitiveDataFromContactPerson = (
  payload: ContactPersonInput
): Partial<ContactPersonInput> =>
  omit(payload, [
    'email',
    'first_name',
    'last_name',
    'membership_number',
    'native_language',
    'phone_number',
    'service_language',
  ]);

export const omitSensitiveDataFromSignupPayload = (
  payload: SignupInput | UpdateSignupMutationInput
): Partial<SignupInput | UpdateSignupMutationInput> =>
  omit(
    {
      ...payload,
      contact_person: payload.contact_person
        ? (omitSensitiveDataFromContactPerson(
            payload.contact_person
          ) as ContactPersonInput)
        : payload.contact_person,
    },
    [
      '__typename',
      'city',
      'date_of_birth',
      'extra_info',
      'first_name',
      'last_name',
      'phone_number',
      'street_address',
      'zipcode',
    ]
  );

export const omitSensitiveDataFromSignupsPayload = (
  payload: CreateSignupsMutationInput
) => ({
  ...payload,
  signups: payload.signups.map((s) => omitSensitiveDataFromSignupPayload(s)),
});

export const canEditSignup = (
  signup: Signup,
  signupGroup?: SignupGroup
): boolean =>
  (signup.has_contact_person_access || signup.is_created_by_current_user) &&
  !signup.payment_cancellation &&
  !signup.payment_refund &&
  !signupGroup?.payment_cancellation &&
  !signupGroup?.payment_refund;

export const canCancelSignup = ({
  event,
  signup,
  signupGroup,
}: {
  event: Event;
  signup: Signup;
  signupGroup?: SignupGroup;
}): boolean =>
  Boolean(canEditSignup(signup, signupGroup) && !isEventStarted(event));

export const getEditSignupWarning = ({
  signup,
  signupGroup,
  t,
}: {
  signup: Signup;
  signupGroup?: SignupGroup;
  t: TFunction;
}): string => {
  if (
    !(signup.has_contact_person_access || signup.is_created_by_current_user)
  ) {
    return t('signup:warnings.insufficientPermissions');
  }
  if (signup.payment_cancellation || signupGroup?.payment_cancellation) {
    return t('signup:warnings.hasPaymentCancellation');
  }
  if (signup.payment_refund || signupGroup?.payment_refund) {
    return t('signup:warnings.hasPaymentRefund');
  }

  return '';
};

export const getCancelSignupWarning = ({
  event,
  signup,
  signupGroup,
  t,
}: {
  event: Event;
  signup: Signup;
  signupGroup?: SignupGroup;
  t: TFunction;
}): string => {
  const editWarning = getEditSignupWarning({ signup, signupGroup, t });
  if (editWarning) {
    return editWarning;
  }
  if (isEventStarted(event)) {
    return t('signup:warnings.eventStarted');
  }

  return '';
};
