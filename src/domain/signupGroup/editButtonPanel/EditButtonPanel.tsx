import { Button, IconCross, IconPen } from 'hds-react';
import { useTranslation } from 'next-i18next';

import ButtonPanel from '../../../common/components/buttonPanel/ButtonPanel';
import { SIGNUP_ACTIONS } from '../../signup/constants';
import { SIGNUP_GROUP_ACTIONS } from '../constants';

type EditButtonPanelProps = {
  disabled: boolean;
  onCancel: () => void;
  onUpdate: () => void;
  savingSignup: SIGNUP_ACTIONS | null;
  savingSignupGroup: SIGNUP_GROUP_ACTIONS | null;
};

const EditButtonPanel: React.FC<EditButtonPanelProps> = ({
  disabled,
  onCancel,
  onUpdate,
  savingSignup,
  savingSignupGroup,
}) => {
  const { t } = useTranslation('signup');
  return (
    <ButtonPanel
      submitButtons={[
        <Button
          key="cancel"
          iconLeft={<IconCross aria-hidden={true} />}
          onClick={onCancel}
          variant="danger"
        >
          {t('buttonCancel')}
        </Button>,

        <Button
          key="update"
          disabled={Boolean(
            disabled ||
              savingSignup === SIGNUP_ACTIONS.UPDATE ||
              savingSignupGroup === SIGNUP_GROUP_ACTIONS.UPDATE
          )}
          iconLeft={<IconPen aria-hidden={true} />}
          isLoading={
            savingSignup === SIGNUP_ACTIONS.UPDATE ||
            savingSignupGroup === SIGNUP_GROUP_ACTIONS.UPDATE
          }
          loadingText={t('buttonUpdate') as string}
          onClick={onUpdate}
          variant="primary"
        >
          {t('buttonUpdate')}
        </Button>,
      ]}
    ></ButtonPanel>
  );
};

export default EditButtonPanel;
