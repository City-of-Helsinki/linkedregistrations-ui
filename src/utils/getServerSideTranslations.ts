import { SSRConfig } from 'next-i18next/pages';
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';

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
