import { signOut } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import React from 'react';

import Button from '../../common/components/button/Button';
import ErrorTemplate from '../../common/components/errorTemplate/ErrorTemplate';
import ErrorPageMeta from '../../common/components/errrorPageMeta/ErrorPageMeta';
import PageWrapper from '../../common/components/pageWrapper/PageWrapper';
import MainContent from '../app/layout/mainContent/MainContent';

import styles from './strongIdentificationRequired.module.scss';

const StrongIdentificationRequired: React.FC = () => {
  const { t } = useTranslation('common');
  const text = t('strongIdentificationRequired.text');
  const title = t('strongIdentificationRequired.title');

  return (
    <PageWrapper>
      <ErrorPageMeta description={text} title={title} />

      <MainContent>
        <ErrorTemplate
          buttons={
            <div className={styles.buttons}>
              <Button
                fullWidth={true}
                onClick={() => signOut()}
                type="button"
                variant="primary"
              >
                {t('signOut')}
              </Button>
            </div>
          }
          text={text}
          title={title}
        />
      </MainContent>
    </PageWrapper>
  );
};

export default StrongIdentificationRequired;
