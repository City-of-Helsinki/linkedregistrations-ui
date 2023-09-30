/* eslint-disable max-len */
import { Form, Formik } from 'formik';
import { IconPen, Notification } from 'hds-react';
import pick from 'lodash/pick';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import React, { FC, useCallback, useRef } from 'react';

import Button from '../../../common/components/button/Button';
import ButtonPanel from '../../../common/components/buttonPanel/ButtonPanel';
import FormikPersist from '../../../common/components/formikPersist/FormikPersist';
import LoadingSpinner from '../../../common/components/loadingSpinner/LoadingSpinner';
import ServerErrorSummary from '../../../common/components/serverErrorSummary/ServerErrorSummary';
import { FORM_NAMES } from '../../../constants';
import { ExtendedSession } from '../../../types';
import Container from '../../app/layout/container/Container';
import MainContent from '../../app/layout/mainContent/MainContent';
import { ROUTES } from '../../app/routes/constants';
import { Event } from '../../event/types';
import NotFound from '../../notFound/NotFound';
import useEventAndRegistrationData from '../../registration/hooks/useEventAndRegistrationData';
import { Registration } from '../../registration/types';
import { clearSeatsReservationData } from '../../reserveSeats/utils';
import { SIGNUP_QUERY_PARAMS } from '../../signup/constants';
import { useSignupServerErrorsContext } from '../../signup/signupServerErrorsContext/hooks/useSignupServerErrorsContext';
import { SignupServerErrorsProvider } from '../../signup/signupServerErrorsContext/SignupServerErrorsContext';
import AuthenticationRequiredNotification from '../authenticationRequiredNotification/AuthenticationRequiredNotification';
import { SIGNUP_GROUP_ACTIONS } from '../constants';
import Divider from '../divider/Divider';
import EventInfo from '../eventInfo/EventInfo';
import FormContainer from '../formContainer/FormContainer';
import useSignupGroupActions from '../hooks/useSignupGroupActions';
import ReservationTimer from '../reservationTimer/ReservationTimer';
import { SignupGroupFormProvider } from '../signupGroupFormContext/SignupGroupFormContext';
import {
  clearCreateSignupGroupFormData,
  getSignupGroupDefaultInitialValues,
} from '../utils';
import { getSignupGroupSchema } from '../validation';

import InformantInfo from './informantInfo/InformantInfo';
import Signups from './signups/Signups';
import SummaryEventInfo from './summaryEventInfo/SummaryEventInfo';
import styles from './summaryPage.module.scss';
import SummaryPageMeta from './summaryPageMeta/SummaryPageMeta';

type SummaryPageProps = {
  event: Event;
  registration: Registration;
};

const SummaryPage: FC<SummaryPageProps> = ({ event, registration }) => {
  const { data: session } = useSession() as {
    data: ExtendedSession | null;
  };

  const { createSignupGroup, saving } = useSignupGroupActions({ registration });

  const reservationTimerCallbacksDisabled = useRef(false);
  const disableReservationTimerCallbacks = useCallback(() => {
    reservationTimerCallbacksDisabled.current = true;
  }, []);

  const { t } = useTranslation(['summary']);
  const router = useRouter();

  const goToSignupGroupCompletedPage = () => {
    // Disable reservation timer callbacks
    // so user is not redirected to create signup page
    disableReservationTimerCallbacks();

    clearCreateSignupGroupFormData(registration.id);
    clearSeatsReservationData(registration.id);

    goToPage(
      ROUTES.SIGNUP_GROUP_COMPLETED.replace('[registrationId]', registration.id)
    );
  };
  const goToCreateSignupGroupPage = () => {
    goToPage(
      ROUTES.CREATE_SIGNUP_GROUP.replace(
        '[registrationId]',
        router.query.registrationId as string
      )
    );
  };

  const initialValues = getSignupGroupDefaultInitialValues();

  const { serverErrorItems, setServerErrorItems, showServerErrors } =
    useSignupServerErrorsContext();

  const goToPage = (pathname: string) => {
    router.push({
      pathname,
      query: pick(router.query, [
        SIGNUP_QUERY_PARAMS.IFRAME,
        SIGNUP_QUERY_PARAMS.REDIRECT_URL,
      ]),
    });
  };

  if (!session) {
    return (
      <MainContent className={styles.summaryPage}>
        <SummaryPageMeta event={event} />
        <Container>
          <FormContainer>
            <AuthenticationRequiredNotification />
            <EventInfo event={event} registration={registration} />
          </FormContainer>
        </Container>
      </MainContent>
    );
  }
  return (
    <MainContent className={styles.summaryPage}>
      <>
        <SummaryPageMeta event={event} />

        <Formik
          initialValues={initialValues}
          onSubmit={/* istanbul ignore next */ () => undefined}
          validationSchema={() => getSignupGroupSchema(registration)}
        >
          {({ values }) => {
            const handleSubmit = async () => {
              try {
                setServerErrorItems([]);

                await getSignupGroupSchema(registration).validate(values, {
                  abortEarly: true,
                });

                createSignupGroup(values, {
                  onError: (error) =>
                    showServerErrors(
                      { error: JSON.parse(error.message) },
                      'signup'
                    ),
                  onSuccess: goToSignupGroupCompletedPage,
                });
              } catch (e) {
                goToCreateSignupGroupPage();
              }
            };

            return (
              <Form noValidate>
                <FormikPersist
                  isSessionStorage={true}
                  name={`${FORM_NAMES.CREATE_SIGNUP_GROUP_FORM}-${registration.id}`}
                  savingDisabled={true}
                />

                <Container withOffset>
                  <FormContainer>
                    <ServerErrorSummary errors={serverErrorItems} />

                    <Notification
                      className={styles.notification}
                      label={t('notificationTitle')}
                    >
                      {t('notificationLabel')}
                    </Notification>
                    <SummaryEventInfo registration={registration} />

                    <Divider />

                    <ReservationTimer
                      callbacksDisabled={
                        reservationTimerCallbacksDisabled.current
                      }
                      disableCallbacks={disableReservationTimerCallbacks}
                      initReservationData={false}
                      onDataNotFound={goToCreateSignupGroupPage}
                      registration={registration}
                    />
                    <Divider />
                    <Signups />
                    <InformantInfo values={values} />
                  </FormContainer>
                </Container>
                <ButtonPanel
                  backButtonAriaLabel={t(
                    'common:navigation.backToSignupGroupForm'
                  )}
                  onBack={goToCreateSignupGroupPage}
                  submitButtons={[
                    <Button
                      disabled={Boolean(saving)}
                      iconLeft={<IconPen aria-hidden={true} />}
                      isLoading={saving == SIGNUP_GROUP_ACTIONS.CREATE}
                      loadingText={t('buttonSend') as string}
                      key="save"
                      onClick={handleSubmit}
                    >
                      {t('buttonSend')}
                    </Button>,
                  ]}
                ></ButtonPanel>
              </Form>
            );
          }}
        </Formik>
      </>
    </MainContent>
  );
};

const SummaryPageWrapper: React.FC = () => {
  const { event, isLoading, registration } = useEventAndRegistrationData();

  return (
    <LoadingSpinner isLoading={isLoading}>
      {event && registration ? (
        <SignupGroupFormProvider>
          <SignupServerErrorsProvider>
            <SummaryPage event={event} registration={registration} />
          </SignupServerErrorsProvider>
        </SignupGroupFormProvider>
      ) : (
        <NotFound />
      )}
    </LoadingSpinner>
  );
};

export default SummaryPageWrapper;
