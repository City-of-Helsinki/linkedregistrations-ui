import capitalize from 'lodash/capitalize';
import get from 'lodash/get';

import { OptionType, Language, ExtendedSession } from '../../types';
import getLocalisedString from '../../utils/getLocalisedString';
import queryBuilder from '../../utils/queryBuilder';
import { callGet } from '../app/fetch/fetchClient';
import { FetchError } from '../app/fetch/fetchError';

import {
  LanguagesQueryVariables,
  LanguagesResponse,
  LELanguage,
} from './types';

export const fetchLanguages = async (
  args: LanguagesQueryVariables,
  session: ExtendedSession | null
): Promise<LanguagesResponse> => {
  try {
    const { data } = await callGet({
      session,
      url: languagesPathBuilder(args),
    });
    return data;
  } catch (error) {
    /* istanbul ignore next */
    throw new Error(JSON.stringify((error as FetchError).data), {
      cause: error,
    });
  }
};

export const languagesPathBuilder = (args: LanguagesQueryVariables): string => {
  const { serviceLanguage } = args;
  const variableToKeyItems = [
    { key: 'service_language', value: serviceLanguage },
  ];

  const query = queryBuilder(variableToKeyItems);

  return `/language/${query}`;
};

export const getLanguageOption = (
  language: LELanguage,
  locale: Language
): OptionType => ({
  label: capitalize(getLocalisedString(language.name, locale)),
  value: language.id,
});

export const sortLanguageOptions = (a: OptionType, b: OptionType): number => {
  const languagePriorities = {
    fi: 3,
    sv: 2,
    en: 1,
  };
  const aPriority = get(languagePriorities, a.value, 0);
  const bPriority = get(languagePriorities, b.value, 0);

  if (aPriority !== bPriority) {
    return bPriority - aPriority;
  }
  return a.label.localeCompare(b.label, undefined, { sensitivity: 'base' });
};
