import { Button } from 'hds-react';
import { useTranslation } from 'next-i18next/pages';
import React from 'react';

import ErrorPageMeta from '../../common/components/errorPageMeta/ErrorPageMeta';
import ErrorTemplate from '../../common/components/errorTemplate/ErrorTemplate';
import MainContent from '../app/layout/mainContent/MainContent';

const NotFound: React.FC = () => {
  const { t } = useTranslation('common');

  return (
    <>
      <ErrorPageMeta
        description={t('errorPage.text')}
        title={t('errorPage.title')}
      />

      <MainContent>
        <ErrorTemplate
          text={t('errorPage.text')}
          title={t('errorPage.title')}
        />
        <Button
          onClick={() => {
            throw new Error('Test error in review');
          }}
        >
          Click to error
        </Button>
      </MainContent>
    </>
  );
};

export default NotFound;
