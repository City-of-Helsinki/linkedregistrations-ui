/* eslint-disable no-console */
import { QueryClient } from '@tanstack/react-query';
import { NextPageContext } from 'next';
import { NextParsedUrlQuery } from 'next/dist/server/request-meta';

import { EVENT_INCLUDES } from '../domain/event/constants';
import { fetchEventQuery } from '../domain/event/query';
import { prefetchPlaceQuery } from '../domain/place/query';
import { fetchRegistrationQuery } from '../domain/registration/query';
import parseIdFromAtId from './parseIdFromAtId';

const prefetchRegistrationAndEvent = async ({
  query,
  queryClient,
  req,
  res,
  shouldPrefetchPlace,
}: {
  query: NextParsedUrlQuery;
  queryClient: QueryClient;
  shouldPrefetchPlace?: boolean;
} & Pick<NextPageContext, 'req' | 'res'>) => {
  try {
    const registration = await fetchRegistrationQuery(
      queryClient,
      { id: query.registrationId as string },
      { req, res }
    );

    const event = await fetchEventQuery(
      queryClient,
      { id: registration?.event, include: EVENT_INCLUDES },
      { req, res }
    );

    const placeId = parseIdFromAtId(event.location['@id']);

    if (shouldPrefetchPlace && placeId) {
      await prefetchPlaceQuery(queryClient, placeId, { req, res });
    }
  } catch (e) /* istanbul ignore next */ {
    console.error(e);
  }
};

export default prefetchRegistrationAndEvent;
