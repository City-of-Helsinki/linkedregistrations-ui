import { dehydrate, QueryClient } from '@tanstack/react-query';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { getSessionAndUser } from '../../utils/getSessionAndUser';
import prefetchRegistrationAndEvent from '../../utils/prefetchRegistrationAndEvent';
import { prefetchEnrolmentQuery } from './query';

type TranslationNamespaces = Array<
  'common' | 'enrolment' | 'reservation' | 'summary'
>;

type Props = {
  translationNamespaces: TranslationNamespaces;
  shouldPrefetchEnrolment: boolean;
  shouldPrefetchPlace: boolean;
};

const generateEnrolmentGetServerSideProps = ({
  shouldPrefetchEnrolment,
  shouldPrefetchPlace,
  translationNamespaces,
}: Props): GetServerSideProps => {
  return async ({ locale, query, req, res }) => {
    const queryClient = new QueryClient();
    const { session } = await getSessionAndUser(queryClient, {
      req,
      res,
    });

    await prefetchRegistrationAndEvent({
      query,
      queryClient,
      req,
      res,
      shouldPrefetchPlace,
    });

    try {
      if (shouldPrefetchEnrolment) {
        await prefetchEnrolmentQuery(queryClient, {
          cancellationCode: query.accessCode as string,
        });
      }
    } catch (e) {
      // eslint-disable-next-line no-console
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
