import { useTranslation } from 'next-i18next';
import React from 'react';

import InfoModal from '../../../../common/components/dialog/infoModal/InfoModal';

export interface ReservationTimeExpiringModalProps {
  isOpen: boolean;
  onClose: () => void;
  timeLeft: number | null;
}

const ReservationTimeExpiringModal: React.FC<
  ReservationTimeExpiringModalProps
> = ({ isOpen, onClose, timeLeft }) => {
  const { t } = useTranslation(['reservation']);

  const id = 'reservation-time-expiring-modal';

  return (
    <InfoModal
      closeButtonText={t(
        'reservation:reservationTimeExpiringModal.buttonClose'
      )}
      description={t('reservation:reservationTimeExpiringModal.text', {
        count: timeLeft as number,
      })}
      heading={t('reservation:reservationTimeExpiringModal.title')}
      id={id}
      isOpen={isOpen}
      onClose={onClose}
    />
  );
};

export default ReservationTimeExpiringModal;
