import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import { ExtendedSession } from '../../types';
import { LanguagesResponse } from './types';
import { fetchLanguages } from './utils';

export const useLanguagesQuery = (): UseQueryResult<LanguagesResponse> => {
  const { data: session } = useSession() as { data: ExtendedSession | null };

  return useQuery<LanguagesResponse, Error>(['languages'], () =>
    fetchLanguages(session)
  );
};
