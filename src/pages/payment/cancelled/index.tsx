import { GetServerSideProps } from 'next';
import React from 'react';

import PaymentCancelledPage from '../../../domain/payment/PaymentCancelledPage';
import getServerSideTranslations from '../../../utils/getServerSideTranslations';

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await getServerSideTranslations({
      locale: locale as string,
      translationNamespaces: ['common', 'paymentCancelled'],
    })),
  },
});
const PaymentCancelled = (): React.ReactElement => {
  return <PaymentCancelledPage />;
};

export default PaymentCancelled;
