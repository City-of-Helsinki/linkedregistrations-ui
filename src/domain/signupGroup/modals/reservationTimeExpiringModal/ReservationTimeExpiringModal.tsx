import { Dialog, IconInfoCircle } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';

import Button from '../../../../common/components/button/Button';
import styles from '../../../../common/components/dialog/dialog.module.scss';

export interface ReservationTimeExpiringModalProps {
  isOpen: boolean;
  onClose: () => void;
  timeLeft: number | null;
}

const ReservationTimeExpiringModal: React.FC<
  ReservationTimeExpiringModalProps
> = ({ isOpen, onClose, timeLeft }) => {
  const { t } = useTranslation(['reservation']);

  const handleClose = (event?: React.MouseEvent | React.KeyboardEvent) => {
    event?.preventDefault();
    event?.stopPropagation();

    onClose();
  };

  const id = 'reservation-time-expiring-modal';
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;

  return (
    <Dialog
      id={id}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className={styles.dialog}
      isOpen={isOpen}
      variant="primary"
    >
      <Dialog.Header
        id={titleId}
        iconLeft={<IconInfoCircle aria-hidden={true} />}
        title={t('reservation:reservationTimeExpiringModal.title')}
      />
      <Dialog.Content>
        <p id={descriptionId}>
          {t('reservation:reservationTimeExpiringModal.text', {
            count: timeLeft as number,
          })}
        </p>
      </Dialog.Content>
      <Dialog.ActionButtons>
        <Button onClick={handleClose} type="button" variant="primary">
          {t('reservation:reservationTimeExpiringModal.buttonClose')}
        </Button>
      </Dialog.ActionButtons>
    </Dialog>
  );
};

export default ReservationTimeExpiringModal;
