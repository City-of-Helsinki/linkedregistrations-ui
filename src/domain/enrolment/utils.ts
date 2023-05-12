import { AxiosError } from 'axios';
import isEqual from 'lodash/isEqual';
import snakeCase from 'lodash/snakeCase';

import { FORM_NAMES } from '../../constants';
import { ExtendedSession } from '../../types';
import formatDate from '../../utils/formatDate';
import queryBuilder from '../../utils/queryBuilder';
import stringToDate from '../../utils/stringToDate';
import { callDelete, callGet, callPost } from '../app/axios/axiosClient';
import { Registration } from '../registration/types';
import { SeatsReservation } from '../reserveSeats/types';
import {
  ATTENDEE_FIELDS,
  ATTENDEE_INITIAL_VALUES,
  ENROLMENT_FIELDS,
  ENROLMENT_INITIAL_VALUES,
  NOTIFICATIONS,
  NOTIFICATION_TYPE,
} from './constants';
import {
  AttendeeFields,
  CreateEnrolmentMutationInput,
  CreateEnrolmentResponse,
  Enrolment,
  EnrolmentFormFields,
  EnrolmentQueryVariables,
  SignupInput,
} from './types';

export const fetchEnrolment = async (
  args: EnrolmentQueryVariables,
  session: ExtendedSession | null
): Promise<Enrolment> => {
  try {
    const { data } = await callGet({
      session,
      url: enrolmentPathBuilder(args),
    });
    return data;
  } catch (error) {
    /* istanbul ignore next */
    throw Error(JSON.stringify((error as AxiosError).response?.data));
  }
};

export const enrolmentPathBuilder = (args: EnrolmentQueryVariables): string => {
  const { cancellationCode, enrolmentId } = args;
  const variableToKeyItems = [
    { key: 'cancellation_code', value: cancellationCode },
  ];

  const query = queryBuilder(variableToKeyItems);

  return `/signup/${enrolmentId}/${query}`;
};

export const createEnrolment = async ({
  input,
  session,
}: {
  input: CreateEnrolmentMutationInput;
  session: ExtendedSession | null;
}): Promise<CreateEnrolmentResponse> => {
  try {
    const { data } = await callPost({
      data: JSON.stringify(input),
      session,
      url: `/signup/`,
    });
    return data;
  } catch (error) {
    throw Error(JSON.stringify((error as AxiosError).response?.data));
  }
};

export const deleteEnrolment = async ({
  cancellationCode,
  enrolmentId,
  session,
}: {
  cancellationCode: string;
  enrolmentId: string;
  session: ExtendedSession | null;
}): Promise<null> => {
  try {
    const variableToKeyItems = [
      { key: 'cancellation_code', value: cancellationCode },
    ];
    const query = queryBuilder(variableToKeyItems);

    const { data } = await callDelete({
      session,
      url: `/signup/${enrolmentId}/${query}`,
    });
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

export const getEnrolmentPayload = ({
  formValues,
  registration,
  reservationCode,
}: {
  formValues: EnrolmentFormFields;
  registration: Registration;
  reservationCode: string;
}): CreateEnrolmentMutationInput => {
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

  const signups: SignupInput[] = attendees.map((attendee) => {
    const { city, dateOfBirth, name, streetAddress, zipcode } = attendee;
    return {
      city: city || '',
      date_of_birth: dateOfBirth
        ? formatDate(stringToDate(dateOfBirth), 'yyyy-MM-dd')
        : null,
      email: email || null,
      extra_info: extraInfo,
      membership_number: membershipNumber,
      name: name || '',
      native_language: nativeLanguage || null,
      notifications: getEnrolmentNotificationsCode(notifications),
      phone_number: phoneNumber || null,
      service_language: serviceLanguage || null,
      street_address: streetAddress || null,
      zipcode: zipcode || null,
    };
  });

  return {
    registration: registration.id,
    reservation_code: reservationCode,
    signups,
  };
};

export const getAttendeeDefaultInitialValues = (): AttendeeFields => ({
  ...ATTENDEE_INITIAL_VALUES,
});

export const getEnrolmentDefaultInitialValues = (): EnrolmentFormFields => ({
  ...ENROLMENT_INITIAL_VALUES,
  attendees: [getAttendeeDefaultInitialValues()],
});

export const getEnrolmentInitialValues = (
  enrolment: Enrolment
): EnrolmentFormFields => {
  return {
    ...getEnrolmentDefaultInitialValues(),
    accepted: true,
    attendees: [
      {
        city: enrolment.city || '-',
        dateOfBirth: enrolment.date_of_birth
          ? formatDate(new Date(enrolment.date_of_birth))
          : '',
        extraInfo: '',
        inWaitingList: false,
        name: enrolment.name || '-',
        streetAddress: enrolment.street_address || '-',
        zipcode: enrolment.zipcode || '-',
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

export const getNewAttendees = ({
  attendees,
  seatsReservation,
}: {
  attendees: AttendeeFields[];
  seatsReservation: SeatsReservation;
}) => {
  const { seats, seats_at_event } = seatsReservation;
  const attendeeInitialValues = getAttendeeDefaultInitialValues();
  const filledAttendees = attendees.filter(
    (a) => !isEqual(a, attendeeInitialValues)
  );
  return [
    ...filledAttendees,
    ...Array(Math.max(seats - filledAttendees.length, 0)).fill(
      attendeeInitialValues
    ),
  ]
    .slice(0, seats)
    .map((attendee, index) => ({
      ...attendee,
      inWaitingList: index + 1 > seats_at_event,
    }));
};

export const isEnrolmentFieldRequired = (
  registration: Registration,
  fieldId: ATTENDEE_FIELDS | ENROLMENT_FIELDS
): boolean => registration.mandatory_fields.includes(snakeCase(fieldId));

export const isDateOfBirthFieldRequired = (
  registration: Registration
): boolean =>
  Boolean(registration.audience_max_age || registration.audience_min_age);
