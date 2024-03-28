import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import { ExtendedSession } from '../../types';

import { LanguagesQueryVariables, LanguagesResponse } from './types';
import { fetchLanguages, languagesPathBuilder } from './utils';

export const useLanguagesQuery = (
  args: LanguagesQueryVariables = {}
): UseQueryResult<LanguagesResponse> => {
  const { data: session } = useSession() as { data: ExtendedSession | null };

  return useQuery<LanguagesResponse, Error>({
    queryKey: [languagesPathBuilder(args)],
    queryFn: () => fetchLanguages(args, session),
  });
};
