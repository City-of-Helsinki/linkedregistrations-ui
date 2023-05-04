import React, {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useMemo,
  useState,
} from 'react';

import useMountedState from '../../../hooks/useMountedState';
import { ENROLMENT_MODALS } from '../constants';
import PersonsAddedToWaitingListModal from '../modals/personsAddedToWaitingListModal/PersonsAddedToWaitingListModal';

export type EnrolmentPageContextProps = {
  closeModal: () => void;
  openModal: ENROLMENT_MODALS | null;
  openParticipant: number | null;
  setOpenModal: (state: ENROLMENT_MODALS | null) => void;
  setOpenParticipant: (index: number | null) => void;
  toggleOpenParticipant: (index: number) => void;
};

export const EnrolmentPageContext = createContext<
  EnrolmentPageContextProps | undefined
>(undefined);

export const EnrolmentPageProvider: FC<PropsWithChildren> = ({ children }) => {
  const [openParticipant, setOpenParticipant] = useState<number | null>(0);

  const [openModal, setOpenModal] = useMountedState<ENROLMENT_MODALS | null>(
    null
  );

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
      setOpenModal,
      setOpenParticipant,
      toggleOpenParticipant,
    }),
    [openModal, openParticipant, setOpenModal, toggleOpenParticipant]
  );

  return (
    <EnrolmentPageContext.Provider value={value}>
      <PersonsAddedToWaitingListModal
        isOpen={openModal === ENROLMENT_MODALS.PERSONS_ADDED_TO_WAITLIST}
        onClose={() => setOpenModal(null)}
      />
      {children}
    </EnrolmentPageContext.Provider>
  );
};
