/* eslint-disable max-len */
import { Form, Formik } from 'formik';
import { IconPen } from 'hds-react';
import pick from 'lodash/pick';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import React, { FC, useCallback, useRef } from 'react';

import Button from '../../../common/components/button/Button';
import ButtonPanel from '../../../common/components/buttonPanel/ButtonPanel';
import FormikPersist from '../../../common/components/formikPersist/FormikPersist';
import LoadingSpinner from '../../../common/components/loadingSpinner/LoadingSpinner';
import Notification from '../../../common/components/notification/Notification';
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
import { isSignupEnded } from '../../registration/utils';
import { clearSeatsReservationData } from '../../reserveSeats/utils';
import { SIGNUP_ACTIONS, SIGNUP_QUERY_PARAMS } from '../../signup/constants';
import useSignupActions from '../../signup/hooks/useSignupActions';
import { useSignupServerErrorsContext } from '../../signup/signupServerErrorsContext/hooks/useSignupServerErrorsContext';
import { SignupServerErrorsProvider } from '../../signup/signupServerErrorsContext/SignupServerErrorsContext';
import { SignupPayment } from '../../signup/types';
import AuthenticationRequiredNotification from '../authenticationRequiredNotification/AuthenticationRequiredNotification';
import { SIGNUP_GROUP_ACTIONS } from '../constants';
import Divider from '../divider/Divider';
import EventInfo from '../eventInfo/EventInfo';
import FormContainer from '../formContainer/FormContainer';
import useSignupGroupActions from '../hooks/useSignupGroupActions';
import useSignupPriceGroupOptions from '../hooks/useSignupPriceGroupOptions';
import ReservationTimer from '../reservationTimer/ReservationTimer';
import { SignupGroupFormProvider } from '../signupGroupFormContext/SignupGroupFormContext';
import SignupIsEnded from '../signupIsEnded/SignupIsEnded';
import { SignupGroupFormFields } from '../types';
import {
  clearCreateSignupGroupFormData,
  getSignupGroupDefaultInitialValues,
  shouldCreatePayment,
} from '../utils';
import { getSignupGroupSchema } from '../validation';

import ContactPersonInfo from './contactPersonInfo/ContactPersonInfo';
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

  const { createSignups, saving: savingSignup } = useSignupActions({
    registration,
  });
  const { createSignupGroup, saving: savingSignupGroup } =
    useSignupGroupActions({ registration });

  const reservationTimerCallbacksDisabled = useRef(false);
  const disableReservationTimerCallbacks = useCallback(() => {
    reservationTimerCallbacksDisabled.current = true;
  }, []);

  const { t } = useTranslation(['summary']);
  const router = useRouter();

  const signupGroupOptions = useSignupPriceGroupOptions(registration);

  const clearTimerAndStorage = () => {
    // Disable reservation timer callbacks
    // so user is not redirected to create signup page
    disableReservationTimerCallbacks();

    clearCreateSignupGroupFormData(registration.id);
    clearSeatsReservationData(registration.id);
  };

  const goToPaymentPage = (payment: SignupPayment) => {
    window.open(payment.checkout_url, '_self', 'noopener,noreferrer');
  };
  const goToSignupCompletedPage = (signupId: string) => {
    clearTimerAndStorage();

    goToPage(
      ROUTES.SIGNUP_COMPLETED.replace(
        '[registrationId]',
        registration.id
      ).replace('[signupId]', signupId)
    );
  };

  const goToSignupGroupCompletedPage = (signupGroupId: string) => {
    clearTimerAndStorage();

    goToPage(
      ROUTES.SIGNUP_GROUP_COMPLETED.replace(
        '[registrationId]',
        registration.id
      ).replace('[signupGroupId]', signupGroupId)
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

  const handleCreateSignup = (values: SignupGroupFormFields) => {
    createSignups(values, {
      onError: (error) =>
        showServerErrors({ error: JSON.parse(error.message) }, 'signup'),
      onSuccess: (response) => {
        if (response) {
          if (response[0].payment) {
            goToPaymentPage(response[0].payment);
          } else {
            goToSignupCompletedPage(response[0].id);
          }
        }
      },
    });
  };

  const handleCreateSignupGroup = (values: SignupGroupFormFields) => {
    createSignupGroup(values, {
      onError: (error) =>
        showServerErrors({ error: JSON.parse(error.message) }, 'signup'),
      onSuccess: (response) => {
        if (response) {
          if (response.payment) {
            goToPaymentPage(response.payment);
          } else {
            goToSignupGroupCompletedPage(response.id);
          }
        }
      },
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
          onSubmit={
            /* istanbul ignore next */
            () => undefined
          }
          validationSchema={() => getSignupGroupSchema(registration)}
        >
          {({ values }) => {
            const sendButtonLabel = shouldCreatePayment(
              signupGroupOptions,
              values.signups
            )
              ? t('buttonGoToPayment')
              : t('buttonSend');

            const handleSubmit = async () => {
              try {
                setServerErrorItems([]);

                await getSignupGroupSchema(registration).validate(values, {
                  abortEarly: true,
                });

                if (values.signups.length === 1) {
                  handleCreateSignup(values);
                } else {
                  handleCreateSignupGroup(values);
                }
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
                      type="info"
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
                    <Signups registration={registration} />
                    <ContactPersonInfo values={values} />
                  </FormContainer>
                </Container>
                <ButtonPanel
                  backButtonAriaLabel={t(
                    'common:navigation.backToSignupGroupForm'
                  )}
                  onBack={goToCreateSignupGroupPage}
                  submitButtons={[
                    <Button
                      disabled={Boolean(savingSignup || savingSignupGroup)}
                      iconLeft={<IconPen aria-hidden={true} />}
                      isLoading={
                        savingSignup === SIGNUP_ACTIONS.CREATE ||
                        savingSignupGroup === SIGNUP_GROUP_ACTIONS.CREATE
                      }
                      loadingText={sendButtonLabel}
                      key="save"
                      onClick={handleSubmit}
                    >
                      {sendButtonLabel}
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
        <>
          {isSignupEnded(registration) ? (
            <SignupIsEnded event={event} />
          ) : (
            <SignupGroupFormProvider registration={registration}>
              <SignupServerErrorsProvider>
                <SummaryPage event={event} registration={registration} />
              </SignupServerErrorsProvider>
            </SignupGroupFormProvider>
          )}
        </>
      ) : (
        <NotFound />
      )}
    </LoadingSpinner>
  );
};

export default SummaryPageWrapper;
