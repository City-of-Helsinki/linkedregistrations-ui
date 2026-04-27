import { ExtendedSession } from '../../types';
import { callGet } from '../app/fetch/fetchClient';
import { FetchError } from '../app/fetch/fetchError';

import { User, UserQueryVariables } from './types';

export const fetchUser = async (
  args: UserQueryVariables,
  session: ExtendedSession | null
): Promise<User> => {
  try {
    const { data } = await callGet({
      session,
      url: userPathBuilder(args),
    });
    return data;
  } catch (error) {
    /* istanbul ignore next */
    throw new Error(JSON.stringify((error as FetchError).data), {
      cause: error,
    });
  }
};

export const userPathBuilder = (args: UserQueryVariables): string => {
  const { username } = args;

  return `/user/${username}/`;
};
