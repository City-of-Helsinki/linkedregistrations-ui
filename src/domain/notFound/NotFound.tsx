import { useTranslation } from 'next-i18next';
import React from 'react';

import ErrorTemplate from '../../common/components/errorTemplate/ErrorTemplate';
import ErrorPageMeta from '../../common/components/errrorPageMeta/ErrorPageMeta';
import PageWrapper from '../../common/components/pageWrapper/PageWrapper';
import MainContent from '../app/layout/mainContent/MainContent';

const NotFound: React.FC = () => {
  const { t } = useTranslation('common');

  return (
    <PageWrapper>
      <ErrorPageMeta
        description={t('errorPage.text')}
        title={t('errorPage.title')}
      />

      <MainContent>
        <ErrorTemplate
          text={t('errorPage.text')}
          title={t('errorPage.title')}
        />
      </MainContent>
    </PageWrapper>
  );
};

export default NotFound;
