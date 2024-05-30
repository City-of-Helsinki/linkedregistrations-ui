import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { FC } from 'react';

import LoadingSpinner from '../../common/components/loadingSpinner/LoadingSpinner';
import SuccessTemplate from '../../common/components/successTemplate/SuccessTemplate';
import MainContent from '../app/layout/mainContent/MainContent';
import NotFound from '../notFound/NotFound';
import { useWebStoreOrderQuery } from '../order/query';

import { useWebStorePaymentQuery } from './query';

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

const PaymentCompletedPageWrapper: React.FC = () => {
  const { query } = useRouter();
  const args = { id: query.orderId as string, user: query.user as string };

  const { isLoading: isLoadingOrder, data: order } = useWebStoreOrderQuery({
    args,
    options: { retry: 0 },
  });

  const { isLoading: isLoadingPayment, data: payment } =
    useWebStorePaymentQuery({
      args,
      options: { retry: 0 },
    });

  return (
    <LoadingSpinner isLoading={isLoadingOrder || isLoadingPayment}>
      {order && payment ? <PaymentCompletedPage /> : <NotFound />}
    </LoadingSpinner>
  );
};

export default PaymentCompletedPageWrapper;
