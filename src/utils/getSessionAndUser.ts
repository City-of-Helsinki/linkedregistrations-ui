import { QueryClient } from '@tanstack/react-query';
import { NextApiRequest, NextApiResponse, NextPageContext } from 'next';
import { unstable_getServerSession } from 'next-auth';

import {
  clearApiTokenFromCookie,
  setApiTokenToCookie,
} from '../domain/auth/utils';
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
  const session = (await unstable_getServerSession(
    ctx.req as NextApiRequest,
    ctx.res as NextApiResponse,
    getNextAuthOptions(ctx.req as NextApiRequest)
  )) as ExtendedSession;
  if (session?.apiToken) {
    setApiTokenToCookie(session?.apiToken as string, ctx);
    user = await fetchUserQuery(
      queryClient,
      { username: session.sub as string },
      ctx
    );
  } else {
    clearApiTokenFromCookie(ctx);
  }

  return { user, session };
};
