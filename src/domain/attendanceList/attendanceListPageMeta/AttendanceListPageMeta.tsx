import Head from 'next/head';
import React from 'react';
import { useTranslation } from 'react-i18next';

import useLocale from '../../../hooks/useLocale';
import { Event } from '../../event/types';
import { getEventFields } from '../../event/utils';

interface Props {
  event: Event;
}

const AttendanceListPageMeta: React.FC<Props> = ({ event }) => {
  const { t } = useTranslation('attendanceList');
  const locale = useLocale();

  const { name } = getEventFields(event, locale);
  const pageTitle = t('attendanceList:pageTitle', { name });

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

export default AttendanceListPageMeta;
