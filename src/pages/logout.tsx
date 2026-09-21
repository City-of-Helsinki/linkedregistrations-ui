import { GetServerSideProps, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';

import Logout from '../domain/logout/LogoutPage';

const LogoutPage: NextPage = () => <Logout />;

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale as string, ['common'])),
    },
  };
};

export default LogoutPage;
