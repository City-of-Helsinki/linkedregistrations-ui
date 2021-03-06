import isNil from 'lodash/isNil';
import uniq from 'lodash/uniq';

import { SUPPORTED_LANGUAGES } from '../constants';
import { LocalisedObject } from '../domain/api/types';
import { Language } from '../types';

/**
 * Return field in selected language or use backup language if needed
 */
const getLocalisedString = (
  obj: LocalisedObject | null,
  language: Language
): string => {
  if (isNil(obj)) return '';

  const languages = uniq([language, ...Object.values(SUPPORTED_LANGUAGES)]);

  const lang = languages.find((lng) => obj[lng]);
  return (lang && obj[lang]) || '';
};

export default getLocalisedString;
