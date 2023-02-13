import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';

import LoadingSpinner from '../../common/components/loadingSpinner/LoadingSpinner';
import SuccessTemplate from '../../common/components/successTemplate/SuccessTemplate';
import useLocale from '../../hooks/useLocale';
import MainContent from '../app/layout/mainContent/MainContent';
import { Event } from '../event/types';
import { getEventFields } from '../event/utils';
import NotFound from '../notFound/NotFound';
import { Registration } from '../registration/types';
import { getRegistrationFields } from '../registration/utils';
import ConfirmationMessage from './confirmationMessage/ConfirmationMessage';
import { ENROLMENT_QUERY_PARAMS } from './constants';
import useEventAndRegistrationData from './hooks/useEventAndRegistrationData';

type Props = {
  event: Event;
  registration: Registration;
};

const EnrolmentCompletedPage: React.FC<Props> = ({ event, registration }) => {
  const { query } = useRouter();
  const { [ENROLMENT_QUERY_PARAMS.REDIRECT_URL]: redirectUrl } = query;
  const { t } = useTranslation(['enrolment']);
  const locale = useLocale();

  const { name } = getEventFields(event, locale);
  const { confirmationMessage } = getRegistrationFields(registration);

  React.useEffect(() => {
    if (typeof redirectUrl === 'string') {
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 5000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MainContent>
      <Head>
        <title>{t('completedPage.title')}</title>
      </Head>
      <SuccessTemplate title={t('completedPage.title')}>
        {confirmationMessage ? (
          <ConfirmationMessage registration={registration} />
        ) : (
          <p>{t('completedPage.text', { name })}</p>
        )}
        {redirectUrl && (
          <>
            <br></br>
            <p>{t('completedPage.redirectInfo1')}</p>
            <p
              dangerouslySetInnerHTML={{
                __html: t('completedPage.redirectInfo2', { url: redirectUrl }),
              }}
            />
          </>
        )}
      </SuccessTemplate>
    </MainContent>
  );
};

const EnrolmentCompletedPageWrapper: React.FC = () => {
  const { event, isLoading, registration } = useEventAndRegistrationData();

  return (
    <LoadingSpinner isLoading={isLoading}>
      {event && registration ? (
        <EnrolmentCompletedPage event={event} registration={registration} />
      ) : (
        <NotFound />
      )}
    </LoadingSpinner>
  );
};

export default EnrolmentCompletedPageWrapper;
