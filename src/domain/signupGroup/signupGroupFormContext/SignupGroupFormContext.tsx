import React, {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useMemo,
  useState,
} from 'react';

import useMountedState from '../../../hooks/useMountedState';
import { Registration } from '../../registration/types';
import { getSeatsReservationData } from '../../reserveSeats/utils';
import { SIGNUP_MODALS } from '../../signup/constants';
import PersonsAddedToWaitingListModal from '../modals/personsAddedToWaitingListModal/PersonsAddedToWaitingListModal';

export type SignupGroupFormContextProps = {
  closeModal: () => void;
  openModal: SIGNUP_MODALS | null;
  openParticipant: number | null;
  participantAmount: number;
  setOpenModal: (state: SIGNUP_MODALS | null) => void;
  setOpenParticipant: (index: number | null) => void;
  setParticipantAmount: (amount: number) => void;
  toggleOpenParticipant: (index: number) => void;
};

export const SignupGroupFormContext = createContext<
  SignupGroupFormContextProps | undefined
>(undefined);

export const SignupGroupFormProvider: FC<
  PropsWithChildren<{ registration: Registration }>
> = ({ children, registration }) => {
  const [openParticipant, setOpenParticipant] = useState<number | null>(0);
  const [participantAmount, setParticipantAmount] = useState(
    Math.max(getSeatsReservationData(registration.id)?.seats ?? 0, 1)
  );

  const [openModal, setOpenModal] = useMountedState<SIGNUP_MODALS | null>(null);

  const toggleOpenParticipant = useCallback(
    (newIndex: number) => {
      setOpenParticipant(openParticipant === newIndex ? null : newIndex);
    },
    [openParticipant]
  );

  const value = useMemo(
    () => ({
      closeModal: () => setOpenModal(null),
      openModal,
      openParticipant,
      participantAmount,
      setOpenModal,
      setOpenParticipant,
      setParticipantAmount,
      toggleOpenParticipant,
    }),
    [
      openModal,
      openParticipant,
      participantAmount,
      setOpenModal,
      toggleOpenParticipant,
    ]
  );

  return (
    <SignupGroupFormContext.Provider value={value}>
      <PersonsAddedToWaitingListModal
        isOpen={openModal === SIGNUP_MODALS.PERSONS_ADDED_TO_WAITLIST}
        onClose={() => setOpenModal(null)}
      />
      {children}
    </SignupGroupFormContext.Provider>
  );
};
