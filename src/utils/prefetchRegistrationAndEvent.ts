/* eslint-disable no-console */
import { QueryClient } from '@tanstack/react-query';
import { NextParsedUrlQuery } from 'next/dist/server/request-meta';

import { REGISTRATION_INCLUDES } from '../domain/registration/constants';
import { fetchRegistrationQuery } from '../domain/registration/query';
import { RegistrationQueryVariables } from '../domain/registration/types';
import { ExtendedSession } from '../types';

const prefetchRegistrationAndEvent = async ({
  overrideRegistrationsVariables,
  query,
  queryClient,
  session,
}: {
  overrideRegistrationsVariables?: Partial<RegistrationQueryVariables>;
  query: NextParsedUrlQuery;
  queryClient: QueryClient;
  session: ExtendedSession | null;
  shouldPrefetchPlace?: boolean;
}) => {
  try {
    await fetchRegistrationQuery({
      args: {
        id: query.registrationId as string,
        include: REGISTRATION_INCLUDES,
        ...overrideRegistrationsVariables,
      },
      queryClient,
      session,
    });
  } catch (e) /* istanbul ignore next */ {
    console.error(e);
  }
};

export default prefetchRegistrationAndEvent;
