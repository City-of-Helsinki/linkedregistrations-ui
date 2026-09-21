import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';
import React from 'react';

import NotFound from '../domain/notFound/NotFound';

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'fi', ['common'])),
    },
  };
};

const NotFoundPage = (): React.ReactElement => {
  return <NotFound />;
};

export default NotFoundPage;
