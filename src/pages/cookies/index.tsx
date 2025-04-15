import { CookieSettingsPage } from 'hds-react';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React from 'react';

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'fi', ['common'])),
    },
  };
};

const CookiesPage = (): React.ReactElement => {
  return <CookieSettingsPage />;
};

export default CookiesPage;
