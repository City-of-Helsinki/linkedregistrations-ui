import { AxiosError } from 'axios';
import isEqual from 'lodash/isEqual';

import { FORM_NAMES, RESERVATION_NAMES } from '../../constants';
import { ExtendedSession } from '../../types';
import formatDate from '../../utils/formatDate';
import queryBuilder from '../../utils/queryBuilder';
import stringToDate from '../../utils/stringToDate';
import { callDelete, callGet, callPost } from '../app/axios/axiosClient';
import { Registration } from '../registration/types';
import { SeatsReservation } from '../reserveSeats/types';
import {
  ATTENDEE_INITIAL_VALUES,
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
  const { cancellationCode } = args;
  const variableToKeyItems = [
    { key: 'cancellation_code', value: cancellationCode },
  ];

  const query = queryBuilder(variableToKeyItems);

  return `/signup/${query}`;
};

export const createEnrolment = async ({
  input,
  registrationId,
  session,
}: {
  input: CreateEnrolmentMutationInput;
  registrationId: string;
  session: ExtendedSession | null;
}): Promise<CreateEnrolmentResponse> => {
  try {
    const { data } = await callPost({
      data: JSON.stringify(input),
      session,
      url: `/registration/${registrationId}/signup/`,
    });
    return data;
  } catch (error) {
    throw Error(JSON.stringify((error as AxiosError).response?.data));
  }
};

export const deleteEnrolment = async ({
  cancellationCode,
  session,
}: {
  cancellationCode: string;
  session: ExtendedSession | null;
}): Promise<null> => {
  try {
    const { data } = await callDelete({
      config: { data: JSON.stringify({ cancellation_code: cancellationCode }) },
      session,
      url: '/signup/',
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
  reservationCode,
}: {
  formValues: EnrolmentFormFields;
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
    const { city, dateOfBirth, name, streetAddress, zip } = attendee;
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
      service_language: serviceLanguage || null,
      street_address: streetAddress || null,
      zipcode: zip || null,
    };
  });

  return {
    reservation_code: reservationCode,
    signups,
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
        inWaitingList: false,
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

export const getNewAttendees = ({
  attendees,
  registration,
  seatsReservation,
}: {
  attendees: AttendeeFields[];
  registration: Registration;
  seatsReservation: SeatsReservation;
}) => {
  const { seats, seats_at_event } = seatsReservation;
  const attendeeInitialValues = getAttendeeDefaultInitialValues(registration);
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
