import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { FC } from 'react';

import SuccessTemplate from '../../common/components/successTemplate/SuccessTemplate';
import MainContent from '../app/layout/mainContent/MainContent';

const PaymentCompletedPage: FC = () => {
  const { t } = useTranslation('paymentCompleted');

  return (
    <MainContent>
      <Head>
        <title>{t('paymentCompleted:title')}</title>
      </Head>
      <SuccessTemplate title={t('paymentCompleted:title')}>
        <p>{t('paymentCompleted:text')}</p>
      </SuccessTemplate>
    </MainContent>
  );
};

export default PaymentCompletedPage;
