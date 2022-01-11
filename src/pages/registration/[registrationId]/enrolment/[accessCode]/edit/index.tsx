import { GetServerSideProps, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { dehydrate, QueryClient } from 'react-query';

import EditEnrolmentPage from '../../../../../../domain/enrolment/EditEnrolmentPage';
import { prefetchEnrolmentQuery } from '../../../../../../domain/enrolment/query';
import { EVENT_INCLUDES } from '../../../../../../domain/event/constants';
import { prefetchEventQuery } from '../../../../../../domain/event/query';
import { fetchRegistrationQuery } from '../../../../../../domain/registration/query';

const EditEnrolment: NextPage = () => <EditEnrolmentPage />;

export const getServerSideProps: GetServerSideProps = async ({
  locale,
  query,
}) => {
  const queryClient = new QueryClient();

  try {
    const registration = await fetchRegistrationQuery(queryClient, {
      id: query.registrationId as string,
    });

    if (registration?.event) {
      await prefetchEventQuery(queryClient, {
        id: registration?.event,
        include: EVENT_INCLUDES,
      });
    }

    await prefetchEnrolmentQuery(queryClient, {
      cancellationCode: query.accessCode as string,
    });
  } catch {}

  return {
    props: {
      ...(await serverSideTranslations(locale as string, [
        'common',
        'enrolment',
      ])),
      dehydratedState: dehydrate(queryClient),
    },
  };
};

export default EditEnrolment;
