import { useTranslation } from 'next-i18next';
import React from 'react';

import Button from '../../common/components/button/Button';
import ErrorTemplate from '../../common/components/errorTemplate/ErrorTemplate';
import ErrorPageMeta from '../../common/components/errrorPageMeta/ErrorPageMeta';
import { LoginMethod } from '../../constants';
import useSignIn from '../../hooks/useSignIn';
import MainContent from '../app/layout/mainContent/MainContent';

import styles from './signInRequired.module.scss';

type Props = {
  loginMethods?: LoginMethod[];
};


const SignInRequired: React.FC<Props> = (props) => {
  const { t } = useTranslation('common');
  const extraSignInParams = props.loginMethods ? { "login_methods": props.loginMethods.join(",") } : undefined;
  const { handleSignIn } = useSignIn(extraSignInParams);

  return (
    <>
      <ErrorPageMeta
        description={t('signInRequired.text')}
        title={t('signInRequired.title')}
      />

      <MainContent>
        <ErrorTemplate
          buttons={
            <div className={styles.buttons}>
              <Button
                fullWidth={true}
                onClick={handleSignIn}
                type="button"
                variant="primary"
              >
                {t('signIn')}
              </Button>
            </div>
          }
          text={t('signInRequired.text')}
          title={t('signInRequired.title')}
        />
      </MainContent>
    </>
  );
};

export default SignInRequired;
