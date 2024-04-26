import { useTranslation } from 'next-i18next';
import React from 'react';

import InfoModal from '../../../../common/components/dialog/infoModal/InfoModal';

export interface PersonsAddedToWaitingListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PersonsAddedToWaitingListModal: React.FC<
  PersonsAddedToWaitingListModalProps
> = ({ isOpen, onClose }) => {
  const { t } = useTranslation('signup');
  const id = 'persons-added-to-waiting-list-modal';

  return (
    <InfoModal
      closeButtonText={t('personsAddedToWaitingListModal.buttonClose')}
      description={t('personsAddedToWaitingListModal.text')}
      heading={t('personsAddedToWaitingListModal.title')}
      id={id}
      isOpen={isOpen}
      onClose={onClose}
    />
  );
};

export default PersonsAddedToWaitingListModal;
