import { signIn } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import React from 'react';

import Button from '../../common/components/button/Button';
import ErrorTemplate from '../../common/components/errorTemplate/ErrorTemplate';
import ErrorPageMeta from '../../common/components/errrorPageMeta/ErrorPageMeta';
import PageWrapper from '../../common/components/pageWrapper/PageWrapper';
import MainContent from '../app/layout/mainContent/MainContent';

import styles from './signInRequired.module.scss';

const SignInRequired: React.FC = () => {
  const { t } = useTranslation('common');

  return (
    <PageWrapper>
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
                onClick={() => signIn('tunnistamo')}
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
    </PageWrapper>
  );
};

export default SignInRequired;
