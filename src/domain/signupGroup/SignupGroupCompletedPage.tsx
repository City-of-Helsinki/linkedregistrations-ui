import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React from 'react';

import LoadingSpinner from '../../common/components/loadingSpinner/LoadingSpinner';
import PageWrapper from '../../common/components/pageWrapper/PageWrapper';
import SuccessTemplate from '../../common/components/successTemplate/SuccessTemplate';
import useLocale from '../../hooks/useLocale';
import MainContent from '../app/layout/mainContent/MainContent';
import { Event } from '../event/types';
import { getEventFields } from '../event/utils';
import NotFound from '../notFound/NotFound';
import useEventAndRegistrationData from '../registration/hooks/useEventAndRegistrationData';
import { Registration } from '../registration/types';
import { getRegistrationFields } from '../registration/utils';
import { SIGNUP_QUERY_PARAMS } from '../signup/constants';

import ConfirmationMessage from './confirmationMessage/ConfirmationMessage';

type Props = {
  event: Event;
  registration: Registration;
};

const SignupGroupCompletedPage: React.FC<Props> = ({ event, registration }) => {
  const { query } = useRouter();
  const { [SIGNUP_QUERY_PARAMS.REDIRECT_URL]: redirectUrl } = query;
  const { t } = useTranslation(['signup']);
  const locale = useLocale();

  const { name } = getEventFields(event, locale);
  const { confirmationMessage } = getRegistrationFields(registration, locale);

  React.useEffect(() => {
    if (typeof redirectUrl === 'string') {
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 5000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PageWrapper>
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
                  __html: t('completedPage.redirectInfo2', {
                    url: redirectUrl,
                  }) as string,
                }}
              />
            </>
          )}
        </SuccessTemplate>
      </MainContent>
    </PageWrapper>
  );
};

const SignupGroupCompletedPageWrapper: React.FC = () => {
  const { event, isLoading, registration } = useEventAndRegistrationData();

  return (
    <LoadingSpinner isLoading={isLoading}>
      {event && registration ? (
        <SignupGroupCompletedPage event={event} registration={registration} />
      ) : (
        <NotFound />
      )}
    </LoadingSpinner>
  );
};

export default SignupGroupCompletedPageWrapper;
