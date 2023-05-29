import { AxiosError } from 'axios';
import isFuture from 'date-fns/isFuture';
import isPast from 'date-fns/isPast';
import isNil from 'lodash/isNil';
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

export const isAttendeeCapacityUsed = (registration: Registration): boolean =>
  !isNil(registration.maximum_attendee_capacity) &&
  registration.maximum_attendee_capacity <= registration.current_attendee_count;

export const isWaitingListCapacityUsed = (
  registration: Registration
): boolean =>
  !isNil(registration.waiting_list_capacity) &&
  registration.waiting_list_capacity <= registration.current_waiting_list_count;

export const getFreeAttendeeCapacity = (
  registration: Registration
): number | undefined =>
  isNil(registration.maximum_attendee_capacity)
    ? undefined
    : (registration.remaining_attendee_capacity as number);

export const getFreeWaitingListCapacity = (
  registration: Registration
): number | undefined =>
  isNil(registration.waiting_list_capacity)
    ? undefined
    : (registration.remaining_waiting_list_capacity as number);

export const getFreeAttendeeOrWaitingListCapacity = (
  registration: Registration
) => {
  const freeAttendeeCapacity = getFreeAttendeeCapacity(registration);
  // Return the amount of free capacity if there are still capacity left
  // Seat reservations are not counted
  if (!isAttendeeCapacityUsed(registration)) {
    return freeAttendeeCapacity;
  }

  return getFreeWaitingListCapacity(registration);
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

  const freeCapacity = getFreeAttendeeOrWaitingListCapacity(registration);

  if (freeCapacity && participantAmount > freeCapacity) {
    return t(`common:${VALIDATION_MESSAGE_KEYS.CAPACITY_MAX}`, {
      max: freeCapacity,
    }) as string;
  }

  return undefined;
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
      !isWaitingListCapacityUsed(registration))
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
    !isWaitingListCapacityUsed(registration)
  ) {
    const freeWaitlistCapacity = getFreeWaitingListCapacity(registration);

    return isNil(freeWaitlistCapacity)
      ? t('enrolment:warnings.capacityInWaitingListNoLimit')
      : t('enrolment:warnings.capacityInWaitingList', {
          count: freeWaitlistCapacity,
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
