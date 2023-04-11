import { AxiosError } from 'axios';
import isFuture from 'date-fns/isFuture';
import isPast from 'date-fns/isPast';
import { TFunction } from 'next-i18next';

import { VALIDATION_MESSAGE_KEYS } from '../../constants';
import { ExtendedSession } from '../../types';
import queryBuilder from '../../utils/queryBuilder';
import { callGet } from '../app/axios/axiosClient';
import {
  Registration,
  RegistrationFields,
  RegistrationQueryVariables,
} from './types';

export const fetchRegistration = async (
  args: RegistrationQueryVariables,
  session: ExtendedSession | null
): Promise<Registration> => {
  try {
    const { data } = await callGet({
      session,
      url: registrationPathBuilder(args),
    });
    return data;
  } catch (error) {
    throw Error(JSON.stringify((error as AxiosError).response?.data));
  }
};

export const registrationPathBuilder = (
  args: RegistrationQueryVariables
): string => {
  const { id, include } = args;
  const variableToKeyItems = [
    { key: 'include', value: include },
    { key: 'nocache', value: true },
  ];

  const query = queryBuilder(variableToKeyItems);

  return `/registration/${id}/${query}`;
};

export const isAttendeeCapacityUsed = (registration: Registration): boolean => {
  // If there are seats in the event
  if (!registration.maximum_attendee_capacity) {
    return false;
  } else if (
    registration.current_attendee_count < registration.maximum_attendee_capacity
  ) {
    return false;
  } else {
    return true;
  }
};

export const getTotalAttendeeCapacity = (
  registration: Registration
): number | undefined => {
  const attendeeCapacity = getFreeAttendeeCapacity(registration);
  // If there are seats in the event
  if (attendeeCapacity === undefined) {
    return undefined;
  }
  return attendeeCapacity + getFreeWaitlistCapacity(registration);
};

export const getFreeAttendeeCapacity = (
  registration: Registration
): number | undefined => {
  // If there are seats in the event
  if (!registration.maximum_attendee_capacity) {
    return undefined;
  }
  return Math.max(
    registration.maximum_attendee_capacity -
      registration.current_attendee_count,
    0
  );
};

export const getFreeWaitlistCapacity = (registration: Registration): number => {
  // If there are seats in the event
  if (!registration.waiting_list_capacity) {
    return 0;
  }

  return Math.max(
    registration.waiting_list_capacity -
      registration.current_waiting_list_count,
    0
  );
};

export const getAttendeeCapacityError = (
  registration: Registration,
  participantAmount: number,
  t: TFunction
): string | undefined => {
  if (participantAmount < 1) {
    return t(`common:${VALIDATION_MESSAGE_KEYS.CAPACITY_MIN}`, {
      min: 1,
    }) as string;
  }

  const freeCapacity = getTotalAttendeeCapacity(registration);

  if (freeCapacity && participantAmount > freeCapacity) {
    return t(`common:${VALIDATION_MESSAGE_KEYS.CAPACITY_MAX}`, {
      max: freeCapacity,
    }) as string;
  }

  return undefined;
};

export const isWaitingCapacityUsed = (registration: Registration): boolean => {
  // If there are seats in the event
  if (
    registration.waiting_list_capacity &&
    registration.current_waiting_list_count < registration.waiting_list_capacity
  ) {
    return false;
  } else {
    return true;
  }
};

export const isRegistrationOpen = (registration: Registration): boolean => {
  return (
    !!registration.enrolment_start_time &&
    isPast(new Date(registration.enrolment_start_time)) &&
    (!registration.enrolment_end_time ||
      isFuture(new Date(registration.enrolment_end_time)))
  );
};

export const isRegistrationPossible = (registration: Registration): boolean => {
  return (
    isRegistrationOpen(registration) &&
    (!isAttendeeCapacityUsed(registration) ||
      !isWaitingCapacityUsed(registration))
  );
};

export const getRegistrationWarning = (
  registration: Registration,
  t: TFunction
): string => {
  if (!isRegistrationPossible(registration)) {
    return t('enrolment:warnings.closed');
  } else if (
    isAttendeeCapacityUsed(registration) &&
    !isWaitingCapacityUsed(registration)
  ) {
    return t('enrolment:warnings.capacityInWaitingList', {
      count: getFreeWaitlistCapacity(registration),
    });
  }
  return '';
};

export const getRegistrationFields = (
  registration: Registration
): RegistrationFields => {
  return {
    audienceMaxAge: registration.audience_max_age || null,
    audienceMinAge: registration.audience_min_age || null,
    confirmationMessage: registration.confirmation_message,
    mandatoryFields: registration.mandatory_fields,
  };
};
