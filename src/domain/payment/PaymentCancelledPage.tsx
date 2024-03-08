import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { FC } from 'react';

import ErrorTemplate from '../../common/components/errorTemplate/ErrorTemplate';
import MainContent from '../app/layout/mainContent/MainContent';

const PaymentCancelledPage: FC = () => {
  const { t } = useTranslation('paymentCancelled');

  return (
    <MainContent>
      <Head>
        <title>{t('paymentCancelled:title')}</title>
      </Head>
      <ErrorTemplate
        text={t('paymentCancelled:text')}
        title={t('paymentCancelled:title')}
      />
    </MainContent>
  );
};

export default PaymentCancelledPage;
