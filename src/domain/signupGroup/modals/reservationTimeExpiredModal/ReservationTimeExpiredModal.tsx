import { useTranslation } from 'next-i18next';
import React from 'react';

import InfoModal from '../../../../common/components/dialog/infoModal/InfoModal';

export interface ReservationTimeExpiredModalProps {
  isOpen: boolean;
  onTryAgain: () => void;
}

const ReservationTimeExpiredModal: React.FC<
  ReservationTimeExpiredModalProps
> = ({ isOpen, onTryAgain }) => {
  const { t } = useTranslation(['reservation']);
  const id = 'reservation-time-expired-modal';

  return (
    <InfoModal
      closeButtonText={t(
        'reservation:reservationTimeExpiredModal.buttonTryAgain'
      )}
      description={t('reservation:reservationTimeExpiredModal.text')}
      heading={t('reservation:reservationTimeExpiredModal.title')}
      id={id}
      isOpen={isOpen}
      onClose={onTryAgain}
    />
  );
};

export default ReservationTimeExpiredModal;
