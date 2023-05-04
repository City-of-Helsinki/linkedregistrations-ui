import { QueryClient } from '@tanstack/react-query';
import { NextApiRequest, NextApiResponse, NextPageContext } from 'next';
import { NextAuthOptions } from 'next-auth';
import { getServerSession } from 'next-auth/next';

import { fetchUserQuery } from '../domain/user/query';
import { User } from '../domain/user/types';
import { getNextAuthOptions } from '../pages/api/auth/[...nextauth]';
import { ExtendedSession } from '../types';

/* istanbul ignore next */
export const getSessionAndUser = async (
  queryClient: QueryClient,
  ctx: Pick<NextPageContext, 'req' | 'res'>
): Promise<{ session: ExtendedSession | null; user: User | null }> => {
  let user: User | null = null;
  const session = await getServerSession<NextAuthOptions, ExtendedSession>(
    ctx.req as NextApiRequest,
    ctx.res as NextApiResponse,
    getNextAuthOptions()
  );
  const linkedEventsApiToken = session?.apiTokens?.linkedevents;

  if (linkedEventsApiToken) {
    try {
      user = await fetchUserQuery({
        args: { username: session.user?.id as string },
        queryClient,
        session,
      });
    } catch (e) /* istanbul ignore next */ {
      // eslint-disable-next-line no-console
      console.error(`Failed to fetch user with error ${e}`);
    }
  }

  return { user, session };
};
