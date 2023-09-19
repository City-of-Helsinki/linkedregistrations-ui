import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import React from 'react';

import CancelledTemplate from '../../common/components/cancelledTempale/CancelledTemplate';
import LoadingSpinner from '../../common/components/loadingSpinner/LoadingSpinner';
import PageWrapper from '../../common/components/pageWrapper/PageWrapper';
import useLocale from '../../hooks/useLocale';
import MainContent from '../app/layout/mainContent/MainContent';
import { Event } from '../event/types';
import { getEventFields } from '../event/utils';
import NotFound from '../notFound/NotFound';
import useEventAndRegistrationData from '../registration/hooks/useEventAndRegistrationData';

type Props = {
  event: Event;
};

const SignupCancelledPage: React.FC<Props> = ({ event }) => {
  const { t } = useTranslation(['signup']);
  const locale = useLocale();

  const { name } = getEventFields(event, locale);

  return (
    <PageWrapper>
      <MainContent>
        <Head>
          <title>{t('cancelledPage.title')}</title>
        </Head>
        <CancelledTemplate title={t('cancelledPage.title')}>
          <p>{t('cancelledPage.text', { name })}</p>
        </CancelledTemplate>
      </MainContent>
    </PageWrapper>
  );
};

const SignupCancelledPageWrapper: React.FC = () => {
  const { event, isLoading } = useEventAndRegistrationData();

  return (
    <LoadingSpinner isLoading={isLoading}>
      {event ? <SignupCancelledPage event={event} /> : <NotFound />}
    </LoadingSpinner>
  );
};

export default SignupCancelledPageWrapper;
