import { useQuery, UseQueryResult } from '@tanstack/react-query';

import { LanguagesResponse } from './types';
import { fetchLanguages } from './utils';

export const useLanguagesQuery = (): UseQueryResult<LanguagesResponse> => {
  return useQuery<LanguagesResponse, Error>(['languages'], () =>
    fetchLanguages()
  );
};
