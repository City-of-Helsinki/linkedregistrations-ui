import {
  ButtonPresetTheme,
  ButtonVariant,
  Dialog,
  IconAlertCircle,
  IconCross,
} from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';

import Button from '../../../../common/components/button/Button';
import styles from '../../../../common/components/dialog/dialog.module.scss';

export interface ConfirmDeleteSignupFromFormModalProps {
  isOpen: boolean;
  isSaving: boolean;
  onClose: () => void;
  onDelete: () => void;
  participantCount: number;
}

const ConfirmDeleteSignupFromFormModal: React.FC<
  ConfirmDeleteSignupFromFormModalProps
> = ({ isOpen, isSaving, onClose, onDelete, participantCount }) => {
  const { t } = useTranslation(['signup', 'common']);

  const handleClose = (event?: React.MouseEvent | React.KeyboardEvent) => {
    event?.preventDefault();
    event?.stopPropagation();

    onClose();
  };

  const handleDelete = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    onDelete();
  };

  const id = 'confirm-participant-delete-modal';
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;

  return (
    <Dialog
      id={id}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className={styles.dialog}
      isOpen={isOpen}
      variant="danger"
    >
      <Dialog.Header
        id={titleId}
        iconStart={<IconAlertCircle aria-hidden={true} />}
        title={t('signup:deleteSignupFromFormModal.title', {
          count: participantCount,
        })}
      />
      <Dialog.Content>
        <p className={styles.warning}>
          <strong>{t('common:warning')}</strong>
        </p>
        <p id={descriptionId}>
          {t('signup:deleteSignupFromFormModal.text1', {
            count: participantCount,
          })}
        </p>
        <p>{t('signup:deleteSignupFromFormModal.text2')}</p>
      </Dialog.Content>
      <Dialog.ActionButtons>
        <Button
          disabled={isSaving}
          iconStart={<IconCross aria-hidden={true} />}
          onClick={handleDelete}
          type="button"
          variant={ButtonVariant.Clear}
        >
          {t('signup:deleteSignupFromFormModal.buttonDelete', {
            count: participantCount,
          })}
        </Button>
        <Button
          disabled={isSaving}
          onClick={handleClose}
          theme={ButtonPresetTheme.Black}
          type="button"
          variant={ButtonVariant.Secondary}
        >
          {t('common:cancel')}
        </Button>
      </Dialog.ActionButtons>
    </Dialog>
  );
};

export default ConfirmDeleteSignupFromFormModal;
