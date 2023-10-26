import { Button } from 'hds-react';
import { signOut } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import React from 'react';

import ErrorTemplate from '../../common/components/errorTemplate/ErrorTemplate';
import ErrorPageMeta from '../../common/components/errrorPageMeta/ErrorPageMeta';
import PageWrapper from '../../common/components/pageWrapper/PageWrapper';
import MainContent from '../app/layout/mainContent/MainContent';

import styles from './insufficientPermissions.module.scss';

const InsufficientPermissions: React.FC = () => {
  const { t } = useTranslation('common');
  const text = t('insufficientPermissions.text');
  const title = t('insufficientPermissions.title');

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

export default InsufficientPermissions;
