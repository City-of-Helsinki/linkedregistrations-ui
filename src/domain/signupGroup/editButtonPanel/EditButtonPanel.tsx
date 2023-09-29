import { Button, IconCross } from 'hds-react';
import { useTranslation } from 'next-i18next';

import ButtonPanel from '../../../common/components/buttonPanel/ButtonPanel';

type EditButtonPanelProps = {
  disabled: boolean;
  onDelete: () => void;
};

const EditButtonPanel: React.FC<EditButtonPanelProps> = ({
  disabled,
  onDelete,
}) => {
  const { t } = useTranslation('signup');
  return (
    <ButtonPanel
      submitButtons={[
        <Button
          key="cancel"
          disabled={disabled}
          iconLeft={<IconCross aria-hidden={true} />}
          onClick={onDelete}
          variant="danger"
        >
          {t('buttonCancel')}
        </Button>,
      ]}
    ></ButtonPanel>
  );
};

export default EditButtonPanel;
