import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React from 'react';

import LoadingSpinner from '../../common/components/loadingSpinner/LoadingSpinner';
import SuccessTemplate from '../../common/components/successTemplate/SuccessTemplate';
import useLocale from '../../hooks/useLocale';
import MainContent from '../app/layout/mainContent/MainContent';
import EventCalendarButton from '../event/eventCalendarButton/EventCalendarButton';
import { Event } from '../event/types';
import { getEventFields } from '../event/utils';
import NotFound from '../notFound/NotFound';
import useEventAndRegistrationData from '../registration/hooks/useEventAndRegistrationData';
import { Registration } from '../registration/types';
import { getRegistrationFields } from '../registration/utils';
import { SIGNUP_QUERY_PARAMS } from '../signup/constants';

import ConfirmationMessage from './confirmationMessage/ConfirmationMessage';
import useSignupGroupData from './hooks/useSignupGroupData';
import styles from './signupGroupCompletedPage.module.scss';
import { isAnySignupInWaitingList } from './utils';

type Props = {
  event: Event;
  inWaitingList: boolean;
  registration: Registration;
};

export const SignupCompletedPage: React.FC<Props> = ({
  event,
  inWaitingList,
  registration,
}) => {
  const { query } = useRouter();
  const { [SIGNUP_QUERY_PARAMS.REDIRECT_URL]: redirectUrl } = query;
  const { t } = useTranslation(['common', 'signup']);
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
    <MainContent>
      <Head>
        <title>{t('signup:completedPage.title')}</title>
      </Head>
      <SuccessTemplate title={t('signup:completedPage.title')}>
        <p>
          {inWaitingList
            ? t('signup:completedPage.textWaitingList', { name })
            : t('signup:completedPage.text', { name })}
        </p>
        {confirmationMessage && (
          <ConfirmationMessage registration={registration} />
        )}
        {redirectUrl && (
          <>
            <br></br>
            <p>{t('signup:completedPage.redirectInfo1')}</p>
            <p
              dangerouslySetInnerHTML={{
                __html: t('signup:completedPage.redirectInfo2', {
                  url: redirectUrl,
                }),
              }}
            />
          </>
        )}

        <p>
          <strong>{t('common:rememberToLogoutText')}</strong>
        </p>

        <EventCalendarButton
          className={styles.eventCalendarButton}
          event={registration.event}
        />
      </SuccessTemplate>
    </MainContent>
  );
};

const SignupGroupCompletedPageWrapper: React.FC = () => {
  const { event, isLoading, registration } = useEventAndRegistrationData();
  const { isLoading: isLoadingSignupGroup, signupGroup } = useSignupGroupData();

  return (
    <LoadingSpinner isLoading={isLoading || isLoadingSignupGroup}>
      {event && registration && signupGroup ? (
        <SignupCompletedPage
          event={event}
          inWaitingList={isAnySignupInWaitingList(signupGroup)}
          registration={registration}
        />
      ) : (
        <NotFound />
      )}
    </LoadingSpinner>
  );
};

export default SignupGroupCompletedPageWrapper;
