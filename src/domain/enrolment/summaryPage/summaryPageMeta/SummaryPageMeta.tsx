import { useTranslation } from 'next-i18next';
import React from 'react';

import { Event } from '../../../event/types';
import EnrolmentPageMeta from '../../enrolmentPageMeta/EnrolmentPageMeta';

interface Props {
  event: Event;
}

const SummaryPageMeta: React.FC<Props> = ({ event }) => {
  const { t } = useTranslation('summary');

  const title = t('pageTitle');

  return <EnrolmentPageMeta event={event} title={title} />;
};

export default SummaryPageMeta;
