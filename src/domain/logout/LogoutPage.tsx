import { useTranslation } from 'next-i18next';
import React from 'react';

import ErrorPageMeta from '../../common/components/errorPageMeta/ErrorPageMeta';
import ErrorTemplate from '../../common/components/errorTemplate/ErrorTemplate';
import PageWrapper from '../../common/components/pageWrapper/PageWrapper';
import MainContent from '../app/layout/mainContent/MainContent';

const LogoutPage: React.FC = () => {
  const { t } = useTranslation('common');
  const text = t('common:logout.text');
  const title = t('common:logout.title');

  return (
    <PageWrapper>
      <ErrorPageMeta description={text} title={title} />
      <MainContent>
        <ErrorTemplate text={text} title={title} />
      </MainContent>
    </PageWrapper>
  );
};

export default LogoutPage;
