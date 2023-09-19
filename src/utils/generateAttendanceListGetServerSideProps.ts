/* eslint-disable no-console */
import { dehydrate, QueryClient } from '@tanstack/react-query';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { REGISTRATION_INCLUDES } from '../domain/registration/constants';
import { ExtendedSSRConfig, TranslationNamespaces } from '../types';

import { getSessionAndUser } from './getSessionAndUser';
import prefetchRegistrationAndEvent from './prefetchRegistrationAndEvent';

type Props = {
  translationNamespaces: TranslationNamespaces;
};

const generateAttendanceListGetServerSideProps = ({
  translationNamespaces,
}: Props): GetServerSideProps<ExtendedSSRConfig> => {
  return async ({ locale, query, req, res }) => {
    const queryClient = new QueryClient();
    const { session } = await getSessionAndUser(queryClient, {
      req,
      res,
    });

    await prefetchRegistrationAndEvent({
      overrideRegistrationsVariables: {
        include: [...REGISTRATION_INCLUDES, 'signups'],
      },
      query,
      queryClient,
      session,
    });

    return {
      props: {
        ...(await serverSideTranslations(
          locale as string,
          translationNamespaces
        )),
        dehydratedState: dehydrate(queryClient),
        session,
      },
    };
  };
};

export default generateAttendanceListGetServerSideProps;
