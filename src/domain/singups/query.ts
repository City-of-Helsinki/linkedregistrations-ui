import {
  UseQueryOptions,
  UseQueryResult,
  useQuery,
} from '@tanstack/react-query';

import { ExtendedSession } from '../../types';
import { SignupsResponse } from '../signup/types';

import { SignupsQueryVariables } from './types';
import { fetchSignups } from './utils';

export const useSignupsQuery = ({
  args,
  options,
  session,
}: {
  args: SignupsQueryVariables;
  options?: Pick<UseQueryOptions, 'enabled'>;
  session: ExtendedSession | null;
}): UseQueryResult<SignupsResponse> => {
  return useQuery<SignupsResponse, Error>({
    queryKey: ['signups', args],
    queryFn: () => fetchSignups(args, session),
    ...options,
  });
};
