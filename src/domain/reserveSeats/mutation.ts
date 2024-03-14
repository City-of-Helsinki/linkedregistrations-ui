import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
} from '@tanstack/react-query';

import { ExtendedSession } from '../../types';

import {
  CreateSeatsReservationInput,
  SeatsReservation,
  UpdateSeatsReservationInput,
} from './types';
import { createSeatsReservation, updateSeatsReservation } from './utils';

export const useCreateSeatsReservationMutation = ({
  options,
  session,
}: {
  options?: UseMutationOptions<
    SeatsReservation,
    Error,
    CreateSeatsReservationInput
  >;
  session: ExtendedSession | null;
}): UseMutationResult<SeatsReservation, Error, CreateSeatsReservationInput> =>
  useMutation({
    mutationFn: (input) => createSeatsReservation({ input, session }),
    ...options,
  });

export const useUpdateSeatsReservationMutation = ({
  options,
  session,
}: {
  options?: UseMutationOptions<
    SeatsReservation,
    Error,
    UpdateSeatsReservationInput
  >;
  session: ExtendedSession | null;
}): UseMutationResult<SeatsReservation, Error, UpdateSeatsReservationInput> =>
  useMutation({
    mutationFn: (input) => updateSeatsReservation({ input, session }),
    ...options,
  });
