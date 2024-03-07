import { SSRConfig } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { TranslationNamespaces } from '../types';

type Props = {
  locale: string;
  translationNamespaces: TranslationNamespaces;
};

const getServerSideTranslations = async ({
  locale,
  translationNamespaces,
}: Props): Promise<SSRConfig> => {
  return serverSideTranslations(locale, translationNamespaces);
};

export default getServerSideTranslations;
