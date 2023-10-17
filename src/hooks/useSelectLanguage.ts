import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React from 'react';

import { SUPPORTED_LANGUAGES } from '../constants';
import { OptionType } from '../types';

import useLocale from './useLocale';

type UseSelectLanguageState = {
  languageOptions: OptionType[];
  changeLanguage: (language: string) => void;
};

const useSelectLanguage = (): UseSelectLanguageState => {
  const { t } = useTranslation('common');
  const locale = useLocale();
  const router = useRouter();

  const languageOptions: OptionType[] = React.useMemo(() => {
    return Object.values(SUPPORTED_LANGUAGES).map((language) => ({
      label: t(`navigation.languages.${language}`),
      value: language,
    }));
  }, [t]);

  const changeLanguage = (newLanguage: string) => {
    if (newLanguage !== locale) {
      router.push(router.asPath, router.asPath, {
        locale: newLanguage,
      });
    }
  };

  return { changeLanguage, languageOptions };
};

export default useSelectLanguage;
