import { ButtonVariant } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';

import Button from '../../common/components/button/Button';
import ErrorTemplate from '../../common/components/errorTemplate/ErrorTemplate';
import ErrorPageMeta from '../../common/components/errrorPageMeta/ErrorPageMeta';
import useSignIn from '../../hooks/useSignIn';
import MainContent from '../app/layout/mainContent/MainContent';

import styles from './signInRequired.module.scss';

const SignInRequired: React.FC = () => {
  const { t } = useTranslation('common');
  const { handleSignIn } = useSignIn();

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
                variant={ButtonVariant.Primary}
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
