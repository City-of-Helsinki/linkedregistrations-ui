export type SeatsReservation = {
  id: string;
  code: string;
  expiration: string;
  in_waitlist: boolean;
  registration: string;
  seats: number;
  timestamp: string;
};

export type CreateSeatsReservationInput = {
  registration: string;
  seats: number;
};

export type UpdateSeatsReservationInput = {
  code: string;
  id: string;
} & CreateSeatsReservationInput;
