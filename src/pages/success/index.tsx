import { dehydrate, QueryClient } from '@tanstack/react-query';
import { GetServerSideProps } from 'next';
import React from 'react';

import { prefetchWebStoreOrderQuery } from '../../domain/order/query';
import PaymentCompletedPage from '../../domain/payment/PaymentCompletedPage';
import { prefetchWebStorePaymentQuery } from '../../domain/payment/query';
import getServerSideTranslations from '../../utils/getServerSideTranslations';

export const getServerSideProps: GetServerSideProps = async ({
  locale,
  query,
}) => {
  const queryClient = new QueryClient();
  const args = { id: query.orderId as string, user: query.user as string };
  await Promise.all([
    prefetchWebStoreOrderQuery({ args, queryClient }),
    prefetchWebStorePaymentQuery({ args, queryClient }),
  ]);

  return {
    props: {
      ...(await getServerSideTranslations({
        locale: locale as string,
        translationNamespaces: ['common', 'paymentCompleted'],
      })),
      dehydratedState: dehydrate(queryClient),
    },
  };
};

const PaymentCompleted = (): React.ReactElement => {
  return <PaymentCompletedPage />;
};

export default PaymentCompleted;
