import { AxiosError } from 'axios';
import { TFunction } from 'i18next';
import isEqual from 'lodash/isEqual';
import omit from 'lodash/omit';
import snakeCase from 'lodash/snakeCase';

import { FORM_NAMES } from '../../constants';
import { ExtendedSession, Language } from '../../types';
import { featureFlagUtils } from '../../utils/featureFlags';
import getLocalisedString from '../../utils/getLocalisedString';
import queryBuilder from '../../utils/queryBuilder';
import skipFalsyType from '../../utils/skipFalsyType';
import {
  callDelete,
  callGet,
  callPost,
  callPut,
} from '../app/axios/axiosClient';
import { Event } from '../event/types';
import { isEventStarted } from '../event/utils';
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
  DeleteSignupGroupMutationInput,
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
  const priceGroupOptions = getSignupPriceGroupOptions(registration, 'fi');
  const createPayment = shouldCreatePayment(priceGroupOptions, signupsValues);

  return {
    contact_person: getContactPersonPayload(contactPerson),
    ...(featureFlagUtils.isFeatureEnabled('WEB_STORE_INTEGRATION') &&
    createPayment
      ? { create_payment: createPayment }
      : {}),
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
    signupGroup.signups ?? /* istanbul ignore next */ []
  ).filter(skipFalsyType);

  return {
    contactPerson: getContactPersonInitialValues(
      signupGroup.contact_person ?? /* istanbul ignore next */ {}
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
  const { accessCode, id } = args;
  const variableToKeyItems = [{ key: 'access_code', value: accessCode }];

  const query = queryBuilder(variableToKeyItems);
  return `/signup_group/${id}/${query}`;
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
  input,
  session,
}: {
  input: DeleteSignupGroupMutationInput;
  session: ExtendedSession | null;
}): Promise<null> => {
  try {
    const { data } = await callDelete({
      session,
      url: signupGroupPathBuilder(input),
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
    : undefined,
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

export const getSignupPriceGroupOptions = (
  registration: Registration,
  locale: Language
) => {
  return (
    registration.registration_price_groups?.map((pg) => {
      const price = pg?.price ? Number(pg.price) : 0;

      return {
        label: [
          `${getLocalisedString(pg?.price_group?.description, locale)}`,
          `${price.toFixed(2).replace('.', ',')} €`,
        ].join(' '),
        price,
        value: pg?.id?.toString() ?? /* istanbul ignore next */ '',
      };
    }) ?? /* istanbul ignore next */ []
  );
};

export const shouldCreatePayment = (
  priceGroupOptions: SignupPriceGroupOption[],
  signups: SignupFormFields[]
) =>
  featureFlagUtils.isFeatureEnabled('WEB_STORE_INTEGRATION') &&
  calculateTotalPrice(
    priceGroupOptions,
    signups.filter((su) => !su.inWaitingList)
  ) > 0;

export const canEditSignupGroup = (signupGroup: SignupGroup) =>
  (signupGroup.is_created_by_current_user ||
    signupGroup.has_contact_person_access) &&
  !signupGroup.payment_cancellation &&
  !signupGroup.payment_refund &&
  !signupGroup.signups?.some(
    (signup) => signup.payment_cancellation || signup.payment_refund
  );

export const canCancelSignupGroup = ({
  event,
  signupGroup,
}: {
  event: Event;
  signupGroup: SignupGroup;
}): boolean =>
  Boolean(canEditSignupGroup(signupGroup) && !isEventStarted(event));

export const getEditSignupGroupWarning = ({
  signupGroup,
  t,
}: {
  signupGroup: SignupGroup;
  t: TFunction;
}): string => {
  if (
    !(
      signupGroup.has_contact_person_access ||
      signupGroup.is_created_by_current_user
    )
  ) {
    return t('signup:warnings.insufficientPermissions');
  }
  if (
    signupGroup.payment_cancellation ||
    signupGroup.signups?.some((signup) => signup.payment_cancellation)
  ) {
    return t('signup:warnings.hasPaymentCancellation');
  }
  if (
    signupGroup.payment_refund ||
    signupGroup.signups?.some((signup) => signup.payment_refund)
  ) {
    return t('signup:warnings.hasPaymentRefund');
  }

  return '';
};

export const getCancelSignupGroupWarning = ({
  event,
  signupGroup,
  t,
}: {
  event: Event;
  signupGroup: SignupGroup;
  t: TFunction;
}): string => {
  const editWarning = getEditSignupGroupWarning({ signupGroup, t });
  if (editWarning) {
    return editWarning;
  }
  if (isEventStarted(event)) {
    return t('signup:warnings.eventStarted');
  }

  return '';
};
