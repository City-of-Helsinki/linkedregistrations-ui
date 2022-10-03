import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { FC, useEffect } from 'react';

import LoadingSpinner from '../common/components/loadingSpinner/LoadingSpinner';
import { ROUTES } from '../domain/app/routes/constants';

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale as string, ['common'])),
    },
  };
};

const Callback: FC = () => {
  const router = useRouter();

  useEffect(() => {
    router.push(
      router.asPath.replace('#', '?').replace('/callback', ROUTES.CALLBACK)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <LoadingSpinner isLoading={true} />;
};

export default Callback;
