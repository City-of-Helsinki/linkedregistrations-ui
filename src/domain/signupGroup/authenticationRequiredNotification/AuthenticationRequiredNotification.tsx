import { ButtonVariant } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';

import Button from '../../../common/components/button/Button';
import Notification from '../../../common/components/notification/Notification';
import useSignIn from '../../../hooks/useSignIn';

import styles from './authenticationRequiredNotification.module.scss';

const AuthenticationRequiredNotification: React.FC = () => {
  const { t } = useTranslation('common');
  const { handleSignIn } = useSignIn();

  return (
    <Notification
      className={styles.notification}
      label={t('common:signIn')}
      type="info"
    >
      <div>{t('common:signInToEnrol')}</div>
      <Button
        className={styles.button}
        onClick={handleSignIn}
        type="button"
        variant={ButtonVariant.Primary}
      >
        {t('signIn')}
      </Button>
    </Notification>
  );
};

export default AuthenticationRequiredNotification;
