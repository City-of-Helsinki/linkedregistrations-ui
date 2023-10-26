import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import React from 'react';

import useLocale from '../../../hooks/useLocale';
import { Event } from '../../event/types';
import { getEventFields } from '../../event/utils';

interface Props {
  event: Event;
}

const SignupsPageMeta: React.FC<Props> = ({ event }) => {
  const { t } = useTranslation('signups');
  const locale = useLocale();

  const { name } = getEventFields(event, locale);
  const pageTitle = t('signups:pageTitle', { name });

  const openGraphProperties = {
    title: pageTitle,
  };

  return (
    <Head>
      <title>{pageTitle}</title>
      {Object.entries(openGraphProperties)
        .filter((p) => p)
        .map(([property, value]) => (
          <meta key={property} property={`og:${property}`} content={value} />
        ))}
    </Head>
  );
};

export default SignupsPageMeta;
