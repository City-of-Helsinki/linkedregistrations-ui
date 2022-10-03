import { AxiosError } from 'axios';
import { capitalize } from 'lodash';
import { NextPageContext } from 'next';

import { OptionType, Language } from '../../types';
import getLocalisedString from '../../utils/getLocalisedString';
import { callGet } from '../app/axios/axiosClient';
import { LanguagesResponse, LELanguage } from './types';

export const fetchLanguages = async (
  ctx?: Pick<NextPageContext, 'req' | 'res'>
): Promise<LanguagesResponse> => {
  try {
    const { data } = await callGet('/language/', undefined, ctx);
    return data;
  } catch (error) {
    /* istanbul ignore next */
    throw Error(JSON.stringify((error as AxiosError).response?.data));
  }
};

export const getLanguageOption = (
  language: LELanguage,
  locale: Language
): OptionType => ({
  label: capitalize(getLocalisedString(language.name, locale)),
  value: language.id,
});

export const sortLanguageOptions = (a: OptionType, b: OptionType): number =>
  a.label > b.label ? 1 : -1;
