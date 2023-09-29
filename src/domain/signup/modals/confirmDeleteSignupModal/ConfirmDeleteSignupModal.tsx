import { Dialog, IconAlertCircle, IconCross } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';

import Button from '../../../../common/components/button/Button';
import styles from '../../../../common/components/dialog/dialog.module.scss';

export interface ConfirmDeleteSignupModalProps {
  isOpen: boolean;
  isSaving: boolean;
  onClose: () => void;
  onDelete: () => void;
}

const ConfirmDeleteSignupModal: React.FC<ConfirmDeleteSignupModalProps> = ({
  isOpen,
  isSaving,
  onClose,
  onDelete,
}) => {
  const { t } = useTranslation(['signup', 'common']);
  const openConfirmationButtonRef = React.useRef(null);
  const id = 'delete-signup-confirmation-dialog';
  const titleId = 'delete-signup-confirmation-dialog-title';
  const descriptionId = 'delete-signup-confirmation-dialog-description';

  return (
    <Dialog
      id={id}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className={styles.dialog}
      isOpen={isOpen}
      focusAfterCloseRef={openConfirmationButtonRef}
      variant="danger"
    >
      <Dialog.Header
        id={titleId}
        title={t('signup:deleteSignupModal.title')}
        iconLeft={<IconAlertCircle aria-hidden="true" />}
      />
      <Dialog.Content>
        <p className={styles.warning}>
          <strong>{t('common:warning')}</strong>
        </p>
        <p id={descriptionId}>{t('signup:deleteSignupModal.text')} </p>
      </Dialog.Content>
      <Dialog.ActionButtons>
        <Button
          disabled={isSaving}
          iconLeft={<IconCross aria-hidden={true} />}
          isLoading={isSaving}
          loadingText={t('signup:deleteSignupModal.buttonCancel') as string}
          onClick={onDelete}
          variant="danger"
        >
          {t('signup:deleteSignupModal.buttonCancel')}
        </Button>
        <Button onClick={onClose} theme={'black'} variant="secondary">
          {t('common:cancel')}
        </Button>
      </Dialog.ActionButtons>
    </Dialog>
  );
};

export default ConfirmDeleteSignupModal;
