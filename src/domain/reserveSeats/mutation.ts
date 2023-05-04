import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
} from '@tanstack/react-query';

import { ExtendedSession } from '../../types';
import {
  ReserveSeatsInput,
  SeatsReservation,
  UpdateReserveSeatsInput,
} from './types';
import { reserveSeats, updateReserveSeats } from './utils';

export const useReserveSeatsMutation = ({
  options,
  session,
}: {
  options?: UseMutationOptions<SeatsReservation, Error, ReserveSeatsInput>;
  session: ExtendedSession | null;
}): UseMutationResult<SeatsReservation, Error, ReserveSeatsInput> =>
  useMutation((input) => reserveSeats({ input, session }), options);

export const useUpdateReserveSeatsMutation = ({
  options,
  session,
}: {
  options?: UseMutationOptions<
    SeatsReservation,
    Error,
    UpdateReserveSeatsInput
  >;
  session: ExtendedSession | null;
}): UseMutationResult<SeatsReservation, Error, UpdateReserveSeatsInput> =>
  useMutation((input) => updateReserveSeats({ input, session }), options);
