import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import React from 'react';

import CancelledTemplate from '../../common/components/cancelledTempale/CancelledTemplate';
import LoadingSpinner from '../../common/components/loadingSpinner/LoadingSpinner';
import useLocale from '../../hooks/useLocale';
import MainContent from '../app/layout/mainContent/MainContent';
import { Event } from '../event/types';
import { getEventFields } from '../event/utils';
import NotFound from '../notFound/NotFound';
import useEventAndRegistrationData from './hooks/useEventAndRegistrationData';

type Props = {
  event: Event;
};

const EnrolmentCompletedPage: React.FC<Props> = ({ event }) => {
  const { t } = useTranslation(['enrolment']);
  const locale = useLocale();

  const { name } = getEventFields(event, locale);

  return (
    <MainContent>
      <Head>
        <title>{t('cancelledPage.title')}</title>
      </Head>
      <CancelledTemplate title={t('cancelledPage.title')}>
        <p>{t('cancelledPage.text', { name })}</p>
      </CancelledTemplate>
    </MainContent>
  );
};

const EnrolmentCancelledPageWrapper: React.FC = () => {
  const { event, isLoading } = useEventAndRegistrationData();

  return (
    <LoadingSpinner isLoading={isLoading}>
      {event ? <EnrolmentCompletedPage event={event} /> : <NotFound />}
    </LoadingSpinner>
  );
};

export default EnrolmentCancelledPageWrapper;
