import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { ROUTES } from '../domain/app/routes/constants';

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale as string, ['common'])),
    },
  };
};

const Callback = (): null => {
  const router = useRouter();

  useEffect(() => {
    router.push(
      router.asPath.replace('#', '?').replace('/callback', ROUTES.CALLBACK)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default Callback;
