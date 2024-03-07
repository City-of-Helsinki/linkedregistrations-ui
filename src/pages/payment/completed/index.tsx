import { GetServerSideProps } from 'next';
import React from 'react';

import PaymentCompletedPage from '../../../domain/payment/PaymentCompletedPage';
import getServerSideTranslations from '../../../utils/getServerSideTranslations';

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await getServerSideTranslations({
      locale: locale as string,
      translationNamespaces: ['common', 'paymentCompleted'],
    })),
  },
});

const PaymentCompleted = (): React.ReactElement => {
  return <PaymentCompletedPage />;
};

export default PaymentCompleted;
