export type SeatsReservation = {
  code: string;
  registration: string;
  seats: number;
  timestamp: string;
};

export type SeatsReservationExtended = { expires: number } & SeatsReservation;

export type ReserveSeatsInput = {
  registration: string;
  seats: number;
  waitlist: boolean;
};

export type UpdateReserveSeatsInput = { code: string } & ReserveSeatsInput;
