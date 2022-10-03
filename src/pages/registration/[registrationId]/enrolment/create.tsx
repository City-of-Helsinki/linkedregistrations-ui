import { dehydrate, QueryClient } from '@tanstack/react-query';
import { GetServerSideProps, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import CreateEnrolmentPage from '../../../../domain/enrolment/CreateEnrolmentPage';
import { EVENT_INCLUDES } from '../../../../domain/event/constants';
import { fetchEventQuery } from '../../../../domain/event/query';
import { prefetchPlaceQuery } from '../../../../domain/place/query';
import { fetchRegistrationQuery } from '../../../../domain/registration/query';
import { getSessionAndUser } from '../../../../utils/getSessionAndUser';
import parseIdFromAtId from '../../../../utils/parseIdFromAtId';

const CreateEnrolment: NextPage = () => <CreateEnrolmentPage />;

export const getServerSideProps: GetServerSideProps = async ({
  locale,
  query,
  req,
  res,
}) => {
  const queryClient = new QueryClient();
  const { session } = await getSessionAndUser(queryClient, {
    req,
    res,
  });

  try {
    const registration = await fetchRegistrationQuery(
      queryClient,
      { id: query.registrationId as string },
      { req, res }
    );

    if (registration?.event) {
      const event = await fetchEventQuery(
        queryClient,
        { id: registration?.event, include: EVENT_INCLUDES },
        { req, res }
      );

      if (event) {
        const placeId = parseIdFromAtId(event.location['@id']);

        if (placeId) {
          await prefetchPlaceQuery(queryClient, placeId, { req, res });
        }
      }
    }
  } catch {}

  return {
    props: {
      ...(await serverSideTranslations(locale as string, [
        'common',
        'enrolment',
      ])),
      dehydratedState: dehydrate(queryClient),
      session,
    },
  };
};

export default CreateEnrolment;
