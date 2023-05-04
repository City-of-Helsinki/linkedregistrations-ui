/* eslint-disable no-console */
import { dehydrate, DehydratedState, QueryClient } from '@tanstack/react-query';
import { GetServerSideProps } from 'next';
import { SSRConfig } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { prefetchEnrolmentQuery } from '../domain/enrolment/query';
import { ExtendedSession } from '../types';
import { getSessionAndUser } from './getSessionAndUser';
import prefetchRegistrationAndEvent from './prefetchRegistrationAndEvent';

type TranslationNamespaces = Array<
  'common' | 'enrolment' | 'reservation' | 'summary'
>;

export type EnrolmentServerSideProps = SSRConfig & {
  dehydratedState: DehydratedState;
  session: ExtendedSession | null;
};

type Props = {
  translationNamespaces: TranslationNamespaces;
  shouldPrefetchEnrolment: boolean;
  shouldPrefetchPlace: boolean;
};

const generateEnrolmentGetServerSideProps = ({
  shouldPrefetchEnrolment,
  shouldPrefetchPlace,
  translationNamespaces,
}: Props): GetServerSideProps<EnrolmentServerSideProps> => {
  return async ({ locale, query, req, res }) => {
    const queryClient = new QueryClient();
    const { session } = await getSessionAndUser(queryClient, {
      req,
      res,
    });

    await prefetchRegistrationAndEvent({
      query,
      queryClient,
      session,
      shouldPrefetchPlace,
    });

    try {
      if (shouldPrefetchEnrolment && typeof query?.accessCode === 'string') {
        await prefetchEnrolmentQuery({
          args: { cancellationCode: query.accessCode },
          queryClient,
          session,
        });
      }
    } catch (e) /* istanbul ignore next */ {
      console.error(e);
    }

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

export default generateEnrolmentGetServerSideProps;
