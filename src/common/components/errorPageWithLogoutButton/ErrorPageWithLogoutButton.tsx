import { ButtonVariant } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';

import MainContent from '../../../domain/app/layout/mainContent/MainContent';
import useSignOut from '../../../hooks/useSignOut';
import Button from '../button/Button';
import ErrorTemplate from '../errorTemplate/ErrorTemplate';
import ErrorPageMeta from '../errrorPageMeta/ErrorPageMeta';
import PageWrapper from '../pageWrapper/PageWrapper';

import styles from './errorPageWithLogoutButton.module.scss';

type Props = {
  text: string;
  title: string;
};

const ErrorPageWithLogoutButton: React.FC<Props> = ({ text, title }) => {
  const { t } = useTranslation('common');

  const { handleSignOut } = useSignOut();
  return (
    <PageWrapper>
      <ErrorPageMeta description={text} title={title} />

      <MainContent>
        <ErrorTemplate
          buttons={
            <div className={styles.buttons}>
              <Button
                fullWidth={true}
                onClick={handleSignOut}
                type="button"
                variant={ButtonVariant.Primary}
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

export default ErrorPageWithLogoutButton;
