import { CookieSettingsPage } from 'hds-react';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React from 'react';

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale as string, ['common'])),
    },
  };
};

const CookiesPage = (): React.ReactElement => {
  return <CookieSettingsPage />;
};

export default CookiesPage;
