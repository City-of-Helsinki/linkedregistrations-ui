import { useTranslation } from 'next-i18next/pages';
import React from 'react';

import { Event } from '../../../event/types';
import SignupPageMeta from '../../../signup/signupPageMeta/SignupPageMeta';

interface Props {
  event: Event;
}

const SummaryPageMeta: React.FC<Props> = ({ event }) => {
  const { t } = useTranslation('summary');

  const title = t('pageTitle');

  return <SignupPageMeta event={event} title={title} />;
};

export default SummaryPageMeta;
