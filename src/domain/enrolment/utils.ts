import { AxiosError } from 'axios';
import addMinutes from 'date-fns/addMinutes';
import isPast from 'date-fns/isPast';
import { NextPageContext } from 'next';

import { FORM_NAMES, RESERVATION_NAMES } from '../../constants';
import formatDate from '../../utils/formatDate';
import getUnixTime from '../../utils/getUnixTime';
import queryBuilder from '../../utils/queryBuilder';
import stringToDate from '../../utils/stringToDate';
import { callDelete, callGet, callPost } from '../app/axios/axiosClient';
import { Registration } from '../registration/types';
import {
  ATTENDEE_INITIAL_VALUES,
  ENROLMENT_INITIAL_VALUES,
  ENROLMENT_TIME_IN_MINUTES,
  ENROLMENT_TIME_PER_PARTICIPANT_IN_MINUTES,
  NOTIFICATIONS,
  NOTIFICATION_TYPE,
} from './constants';
import {
  AttendeeFields,
  CreateEnrolmentMutationInput,
  Enrolment,
  EnrolmentFormFields,
  EnrolmentQueryVariables,
  EnrolmentReservation,
} from './types';

export const fetchEnrolment = async (
  args: EnrolmentQueryVariables,
  ctx?: Pick<NextPageContext, 'req' | 'res'>
): Promise<Enrolment> => {
  try {
    const { data } = await callGet(enrolmentPathBuilder(args), undefined, ctx);
    return data;
  } catch (error) {
    /* istanbul ignore next */
    throw Error(JSON.stringify((error as AxiosError).response?.data));
  }
};

export const enrolmentPathBuilder = (args: EnrolmentQueryVariables): string => {
  const { cancellationCode } = args;
  const variableToKeyItems = [
    { key: 'cancellation_code', value: cancellationCode },
  ];

  const query = queryBuilder(variableToKeyItems);

  return `/signup/${query}`;
};

export const createEnrolment = async (
  input: CreateEnrolmentMutationInput,
  ctx?: Pick<NextPageContext, 'req' | 'res'>
): Promise<Enrolment> => {
  try {
    const { data } = await callPost(
      '/signup/',
      JSON.stringify(input),
      undefined,
      ctx
    );
    return data;
  } catch (error) {
    throw Error(JSON.stringify((error as AxiosError).response?.data));
  }
};

export const deleteEnrolment = async (
  cancellationCode: string,
  ctx?: Pick<NextPageContext, 'req' | 'res'>
): Promise<null> => {
  try {
    const { data } = await callDelete(
      '/signup/',
      { data: JSON.stringify({ cancellation_code: cancellationCode }) },
      ctx
    );
    return data;
  } catch (error) {
    throw Error(JSON.stringify((error as AxiosError).response?.data));
  }
};

export const getEnrolmentNotificationsCode = (
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

export const getEnrolmentNotificationTypes = (
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

export const getEnrolmentPayload = (
  formValues: EnrolmentFormFields,
  registration: Registration
): CreateEnrolmentMutationInput => {
  const {
    attendees,
    email,
    extraInfo,
    membershipNumber,
    nativeLanguage,
    notifications,
    phoneNumber,
    serviceLanguage,
  } = formValues;
  const { city, dateOfBirth, name, streetAddress, zip } = attendees[0] || {};

  return {
    city: city || null,
    date_of_birth: dateOfBirth
      ? formatDate(stringToDate(dateOfBirth), 'yyyy-MM-dd')
      : null,
    email: email || null,
    extra_info: extraInfo,
    membership_number: membershipNumber,
    name: name || null,
    native_language: nativeLanguage || null,
    notifications: getEnrolmentNotificationsCode(notifications),
    phone_number: phoneNumber || null,
    registration: registration.id as string,
    service_language: serviceLanguage || null,
    street_address: streetAddress || null,
    zipcode: zip || null,
  };
};

export const getAttendeeDefaultInitialValues = (
  registration: Registration
): AttendeeFields => ({
  ...ATTENDEE_INITIAL_VALUES,
  audienceMaxAge: registration.audience_max_age ?? null,
  audienceMinAge: registration.audience_min_age ?? null,
});

export const getEnrolmentDefaultInitialValues = (
  registration: Registration
): EnrolmentFormFields => ({
  ...ENROLMENT_INITIAL_VALUES,
  attendees: [getAttendeeDefaultInitialValues(registration)],
});

export const getEnrolmentInitialValues = (
  enrolment: Enrolment,
  registration: Registration
): EnrolmentFormFields => {
  return {
    ...getEnrolmentDefaultInitialValues(registration),
    accepted: true,
    attendees: [
      {
        audienceMaxAge: registration.audience_max_age ?? null,
        audienceMinAge: registration.audience_min_age ?? null,
        city: enrolment.city || '-',
        dateOfBirth: enrolment.date_of_birth
          ? formatDate(new Date(enrolment.date_of_birth))
          : '',
        extraInfo: '',
        name: enrolment.name || '-',
        streetAddress: enrolment.street_address || '-',
        zip: enrolment.zipcode || '-',
      },
    ],
    email: enrolment.email || '-',
    extraInfo: enrolment.extra_info || '-',
    membershipNumber: enrolment.membership_number || '-',
    nativeLanguage: enrolment.native_language ?? '',
    notifications: getEnrolmentNotificationTypes(
      enrolment.notifications as string
    ),
    phoneNumber: enrolment.phone_number || '-',
    serviceLanguage: enrolment.service_language ?? '',
  };
};

export const clearCreateEnrolmentFormData = (registrationId: string): void => {
  sessionStorage?.removeItem(
    `${FORM_NAMES.CREATE_ENROLMENT_FORM}-${registrationId}`
  );
};

export const clearEnrolmentReservationData = (registrationId: string): void => {
  sessionStorage?.removeItem(
    `${RESERVATION_NAMES.ENROLMENT_RESERVATION}-${registrationId}`
  );
};

export const getEnrolmentReservationData = (
  registrationId: string
): EnrolmentReservation | null => {
  /* istanbul ignore next */
  if (typeof sessionStorage === 'undefined') return null;

  const data = sessionStorage?.getItem(
    `${RESERVATION_NAMES.ENROLMENT_RESERVATION}-${registrationId}`
  );

  return data ? JSON.parse(data) : null;
};

export const setEnrolmentReservationData = (
  registrationId: string,
  reservationData: EnrolmentReservation
): void => {
  sessionStorage?.setItem(
    `${RESERVATION_NAMES.ENROLMENT_RESERVATION}-${registrationId}`,
    JSON.stringify(reservationData)
  );
};

export const updateEnrolmentReservationData = (
  registration: Registration,
  participants: number
) => {
  const data = getEnrolmentReservationData(registration.id);
  // TODO: Get this data from the API when BE part is implemented
  /* istanbul ignore else */
  if (data && !isPast(data.expires * 1000)) {
    setEnrolmentReservationData(registration.id, {
      ...data,
      expires: getUnixTime(
        addMinutes(
          data.started * 1000,
          ENROLMENT_TIME_IN_MINUTES +
            Math.max(participants - 1, 0) *
              ENROLMENT_TIME_PER_PARTICIPANT_IN_MINUTES
        )
      ),
      participants,
    });
  }
};

export const getRegistrationTimeLeft = (registration: Registration) => {
  const now = new Date();
  const reservationData = getEnrolmentReservationData(registration.id);
  return reservationData ? reservationData.expires - getUnixTime(now) : 0;
};
