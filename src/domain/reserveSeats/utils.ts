import { AxiosError } from 'axios';
import isPast from 'date-fns/isPast';

import { RESERVATION_NAMES } from '../../constants';
import { ExtendedSession } from '../../types';
import getUnixTime from '../../utils/getUnixTime';
import { callPost, callPut } from '../app/axios/axiosClient';
import {
  CreateSeatsReservationInput,
  SeatsReservation,
  UpdateSeatsReservationInput,
} from './types';

export const createSeatsReservation = async ({
  input,
  session,
}: {
  input: CreateSeatsReservationInput;
  session: ExtendedSession | null;
}): Promise<SeatsReservation> => {
  try {
    const { data } = await callPost({
      data: JSON.stringify(input),
      session,
      url: `/seats_reservation/`,
    });
    return data;
  } catch (error) {
    throw Error(JSON.stringify((error as AxiosError).response?.data));
  }
};

export const updateSeatsReservation = async ({
  input: { id, ...input },
  session,
}: {
  input: UpdateSeatsReservationInput;
  session: ExtendedSession | null;
}): Promise<SeatsReservation> => {
  try {
    const { data } = await callPut({
      data: JSON.stringify(input),
      session,
      url: `/seats_reservation/${id}/`,
    });
    return data;
  } catch (error) {
    throw Error(JSON.stringify((error as AxiosError).response?.data));
  }
};

export const getSeatsReservationData = (
  registrationId: string
): SeatsReservation | null => {
  /* istanbul ignore next */
  if (typeof sessionStorage === 'undefined') return null;

  const data = sessionStorage?.getItem(
    `${RESERVATION_NAMES.ENROLMENT_RESERVATION}-${registrationId}`
  );

  return data ? JSON.parse(data) : null;
};

export const setSeatsReservationData = (
  registrationId: string,
  seatsReservation: SeatsReservation
): void => {
  sessionStorage?.setItem(
    `${RESERVATION_NAMES.ENROLMENT_RESERVATION}-${registrationId}`,
    JSON.stringify(seatsReservation)
  );
};

export const clearSeatsReservationData = (registrationId: string): void => {
  sessionStorage?.removeItem(
    `${RESERVATION_NAMES.ENROLMENT_RESERVATION}-${registrationId}`
  );
};

export const isSeatsReservationExpired = (data: SeatsReservation) => {
  return isPast(new Date(data.expiration));
};

export const getRegistrationTimeLeft = (data: SeatsReservation | null) => {
  const now = new Date();

  return data ? getUnixTime(new Date(data.expiration)) - getUnixTime(now) : 0;
};
