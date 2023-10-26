import { AxiosError } from 'axios';
import isFuture from 'date-fns/isFuture';
import isPast from 'date-fns/isPast';
import isNil from 'lodash/isNil';
import { TFunction } from 'next-i18next';

import { MenuItemOptionProps } from '../../common/components/menuDropdown/types';
import { VALIDATION_MESSAGE_KEYS } from '../../constants';
import { ExtendedSession, Language } from '../../types';
import getLocalisedString from '../../utils/getLocalisedString';
import queryBuilder from '../../utils/queryBuilder';
import { callGet } from '../app/axios/axiosClient';
import {
  getSeatsReservationData,
  isSeatsReservationExpired,
} from '../reserveSeats/utils';
import { User } from '../user/types';

import {
  REGISTRATION_ACTIONS,
  REGISTRATION_ICONS,
  REGISTRATION_LABEL_KEYS,
} from './constants';
import { checkCanUserDoRegistrationAction } from './permissions';
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

const getReservedSeats = (registration: Registration): number => {
  const data = getSeatsReservationData(registration.id);
  return data && !isSeatsReservationExpired(data) ? data.seats : 0;
};

export const getMaxSeatsAmount = (
  registration: Registration
): number | undefined => {
  const reservedSeats = getReservedSeats(registration);
  const maximumGroupSize = registration.maximum_group_size;
  const freeCapacity = getFreeAttendeeOrWaitingListCapacity(registration);
  const maxSeatsAmount =
    freeCapacity !== undefined
      ? freeCapacity + reservedSeats
      : /* istanbul ignore next */ undefined;

  const maxValues = [maximumGroupSize, maxSeatsAmount].filter(
    (v) => !isNil(v)
  ) as number[];

  return maxValues.length ? Math.min(...maxValues) : undefined;
};

export const getAttendeeCapacityError = (
  registration: Registration,
  participantAmount: number,
  t: TFunction
): string | undefined => {
  if (participantAmount < 1) {
    return t(`common:${VALIDATION_MESSAGE_KEYS.CAPACITY_MIN}`, {
      min: 1,
    });
  }

  const freeCapacity = getFreeAttendeeOrWaitingListCapacity(registration);

  if (freeCapacity && participantAmount > freeCapacity) {
    return t(`common:${VALIDATION_MESSAGE_KEYS.CAPACITY_MAX}`, {
      max: freeCapacity,
    });
  }

  return undefined;
};

export const isRegistrationOpen = (registration: Registration): boolean => {
  const enrolmentStartTime = registration.enrolment_start_time;
  const enrolmentEndTime = registration.enrolment_end_time;

  // Registration is not open if enrolment start time is defined and in the future
  if (enrolmentStartTime && isFuture(new Date(enrolmentStartTime))) {
    return false;
  }
  // Registration is not open if enrolment end time is defined and in the past
  if (enrolmentEndTime && isPast(new Date(enrolmentEndTime))) {
    return false;
  }

  return true;
};

export const isSignupEnded = (registration: Registration): boolean => {
  const enrolmentEndTime = registration.enrolment_end_time;

  // Signup is ended if enrolment end time is defined and in the past
  return Boolean(enrolmentEndTime && isPast(new Date(enrolmentEndTime)));
};

export const isRegistrationPossible = (registration: Registration): boolean => {
  const registrationOpen = isRegistrationOpen(registration);
  const attendeeCapacityUsed = isAttendeeCapacityUsed(registration);
  const freeAttendeeCapacity = getFreeAttendeeCapacity(registration);
  const waitingListCapacityUsed = isWaitingListCapacityUsed(registration);
  const freeWaitingListCapacity = getFreeWaitingListCapacity(registration);

  // Enrolment is not opened or is already closed
  if (!registrationOpen) {
    return false;
  }
  // Attendee capacity and waiting list capacity is used
  if (attendeeCapacityUsed && waitingListCapacityUsed) {
    return false;
  }
  // Attendee capacity is not used
  if (!attendeeCapacityUsed) {
    return freeAttendeeCapacity !== 0;
  }

  // Waiting list capacity is not used
  return freeWaitingListCapacity !== 0;
};

export const getRegistrationWarning = (
  registration: Registration,
  t: TFunction
): string => {
  const registrationOpen = isRegistrationOpen(registration);
  const registrationPossible = isRegistrationPossible(registration);
  const attendeeCapacityUsed = isAttendeeCapacityUsed(registration);
  const waitingListCapacityUsed = isWaitingListCapacityUsed(registration);
  const freeWaitlistCapacity = getFreeWaitingListCapacity(registration);

  if (!registrationOpen) {
    return t('signup:warnings.closed');
  }

  if (!registrationPossible) {
    return t('signup:warnings.allSeatsReserved');
  }

  if (attendeeCapacityUsed && !waitingListCapacityUsed) {
    return isNil(freeWaitlistCapacity)
      ? t('signup:warnings.capacityInWaitingListNoLimit')
      : t('signup:warnings.capacityInWaitingList', {
          count: freeWaitlistCapacity,
        });
  }
  return '';
};

export const getRegistrationFields = (
  registration: Registration,
  locale: Language
): RegistrationFields => {
  return {
    audienceMaxAge: registration.audience_max_age ?? null,
    audienceMinAge: registration.audience_min_age ?? null,
    confirmationMessage: getLocalisedString(
      registration.confirmation_message,
      locale
    ),
    instructions: getLocalisedString(registration.instructions, locale),
    mandatoryFields: registration.mandatory_fields,
  };
};

export const getRegistrationActionButtonProps = ({
  action,
  onClick,
  registration,
  t,
  user,
}: {
  action: REGISTRATION_ACTIONS;
  onClick: () => void;
  registration?: Registration;
  t: TFunction;
  user?: User;
}): MenuItemOptionProps => {
  const canDoAction = checkCanUserDoRegistrationAction({
    action,
    registration,
    user,
  });

  return {
    disabled: !canDoAction,
    icon: REGISTRATION_ICONS[action],
    label: t(REGISTRATION_LABEL_KEYS[action]),
    onClick,
  };
};
