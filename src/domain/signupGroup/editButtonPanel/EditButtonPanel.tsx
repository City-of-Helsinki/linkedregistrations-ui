import { Button, IconCross, IconPen } from 'hds-react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

import ButtonPanel from '../../../common/components/buttonPanel/ButtonPanel';
import { SIGNUP_ACTIONS } from '../../signup/constants';
import { SIGNUPS_SEARCH_PARAMS } from '../../singups/constants';
import { SIGNUP_GROUP_ACTIONS } from '../constants';

type EditButtonPanelProps = {
  allowToCancel: boolean;
  allowToEdit: boolean;
  cancelWarning: string;
  disabled: boolean;
  editWarning: string;
  onCancel: () => void;
  onUpdate: () => void;
  savingSignup: SIGNUP_ACTIONS | null;
  savingSignupGroup: SIGNUP_GROUP_ACTIONS | null;
};

const EditButtonPanel: React.FC<EditButtonPanelProps> = ({
  allowToCancel,
  allowToEdit,
  cancelWarning,
  editWarning,
  disabled,
  onCancel,
  onUpdate,
  savingSignup,
  savingSignupGroup,
}) => {
  const { t } = useTranslation(['signup', 'common']);
  const router = useRouter();
  const returnPathQuery = router.query[SIGNUPS_SEARCH_PARAMS.RETURN_PATH];

  const handleBack = () => {
    /* istanbul ignore next */
    if (!returnPathQuery) return;

    const returnPath =
      typeof returnPathQuery === 'string'
        ? returnPathQuery
        : returnPathQuery[0];

    router.push(returnPath);
  };

  if (!allowToEdit && !returnPathQuery) {
    return null;
  }

  return (
    <ButtonPanel
      backButtonAriaLabel={t('common:buttonBack')}
      onBack={
        router.query[SIGNUPS_SEARCH_PARAMS.RETURN_PATH] ? handleBack : undefined
      }
      submitButtons={[
        <Button
          key="cancel"
          disabled={!allowToCancel}
          iconLeft={<IconCross aria-hidden={true} />}
          onClick={onCancel}
          title={cancelWarning}
          variant="danger"
        >
          {t('buttonCancel')}
        </Button>,
        <Button
          key="update"
          disabled={Boolean(
            disabled ||
              !allowToEdit ||
              savingSignup === SIGNUP_ACTIONS.UPDATE ||
              savingSignupGroup === SIGNUP_GROUP_ACTIONS.UPDATE
          )}
          iconLeft={<IconPen aria-hidden={true} />}
          isLoading={
            savingSignup === SIGNUP_ACTIONS.UPDATE ||
            savingSignupGroup === SIGNUP_GROUP_ACTIONS.UPDATE
          }
          loadingText={t('buttonUpdate')}
          onClick={onUpdate}
          title={editWarning}
          variant="primary"
        >
          {t('buttonUpdate')}
        </Button>,
      ]}
    ></ButtonPanel>
  );
};

export default EditButtonPanel;
