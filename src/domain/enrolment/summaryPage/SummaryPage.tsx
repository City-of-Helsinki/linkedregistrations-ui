import { Form, Formik } from 'formik';
import { Notification } from 'hds-react';
import pick from 'lodash/pick';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import React, { FC, useCallback, useRef } from 'react';

import Button from '../../../common/components/button/Button';
import FormikPersist from '../../../common/components/formikPersist/FormikPersist';
import LoadingSpinner from '../../../common/components/loadingSpinner/LoadingSpinner';
import ServerErrorSummary from '../../../common/components/serverErrorSummary/ServerErrorSummary';
import { FORM_NAMES } from '../../../constants';
import Container from '../../app/layout/container/Container';
import MainContent from '../../app/layout/mainContent/MainContent';
import { ROUTES } from '../../app/routes/constants';
import { Event } from '../../event/types';
import NotFound from '../../notFound/NotFound';
import { Registration } from '../../registration/types';
import {
  clearSeatsReservationData,
  getSeatsReservationData,
} from '../../reserveSeats/utils';
import ButtonWrapper from '../buttonWrapper/ButtonWrapper';
import { ENROLMENT_QUERY_PARAMS } from '../constants';
import Divider from '../divider/Divider';
import { EnrolmentPageProvider } from '../enrolmentPageContext/EnrolmentPageContext';
import { EnrolmentServerErrorsProvider } from '../enrolmentServerErrorsContext/EnrolmentServerErrorsContext';
import { useEnrolmentServerErrorsContext } from '../enrolmentServerErrorsContext/hooks/useEnrolmentServerErrorsContext';
import FormContainer from '../formContainer/FormContainer';
import useEnrolmentActions from '../hooks/useEnrolmentActions';
import useEventAndRegistrationData from '../hooks/useEventAndRegistrationData';
import ReservationTimer from '../reservationTimer/ReservationTimer';
import {
  clearCreateEnrolmentFormData,
  getEnrolmentDefaultInitialValues,
  getEnrolmentPayload,
} from '../utils';
import { getEnrolmentSchema } from '../validation';
import Attendees from './attendees/Attendees';
import InformantInfo from './informantInfo/InformantInfo';
import SummaryEventInfo from './summaryEventInfo/SummaryEventInfo';
import styles from './summaryPage.module.scss';
import SummaryPageMeta from './summaryPageMeta/SummaryPageMeta';

type SummaryPageProps = {
  event: Event;
  registration: Registration;
};

const SummaryPage: FC<SummaryPageProps> = ({ event, registration }) => {
  const { createEnrolment } = useEnrolmentActions({ registration });

  const reservationTimerCallbacksDisabled = useRef(false);
  const disableReservationTimerCallbacks = useCallback(() => {
    reservationTimerCallbacksDisabled.current = true;
  }, []);

  const { t } = useTranslation(['summary']);
  const router = useRouter();

  const goToEnrolmentCompletedPage = () => {
    // Disable reservation timer callbacks
    // so user is not redirected to create enrolment page
    disableReservationTimerCallbacks();

    clearCreateEnrolmentFormData(registration.id);
    clearSeatsReservationData(registration.id);

    goToPage(
      ROUTES.ENROLMENT_COMPLETED.replace('[registrationId]', registration.id)
    );
  };

  const goToCreateEnrolmentPage = () => {
    goToPage(
      ROUTES.CREATE_ENROLMENT.replace(
        '[registrationId]',
        router.query.registrationId as string
      )
    );
  };

  const initialValues = getEnrolmentDefaultInitialValues();

  const { serverErrorItems, setServerErrorItems, showServerErrors } =
    useEnrolmentServerErrorsContext();

  const goToPage = (pathname: string) => {
    router.push({
      pathname,
      query: pick(router.query, [
        ENROLMENT_QUERY_PARAMS.IFRAME,
        ENROLMENT_QUERY_PARAMS.REDIRECT_URL,
      ]),
    });
  };

  return (
    <MainContent className={styles.summaryPage}>
      <SummaryPageMeta event={event} />
      <Container>
        <FormContainer>
          <ServerErrorSummary errors={serverErrorItems} />
          <Notification
            className={styles.notification}
            label={t('notificationTitle')}
          >
            {t('notificationLabel')}
          </Notification>
          <SummaryEventInfo registration={registration} />

          <Formik
            initialValues={initialValues}
            onSubmit={/* istanbul ignore next */ () => undefined}
            validationSchema={() => getEnrolmentSchema(registration)}
          >
            {({ values }) => {
              const handleSubmit = async () => {
                try {
                  setServerErrorItems([]);

                  await getEnrolmentSchema(registration).validate(values, {
                    abortEarly: true,
                  });

                  const reservationData = getSeatsReservationData(
                    registration.id
                  );
                  const payload = getEnrolmentPayload({
                    formValues: values,
                    reservationCode: reservationData?.code as string,
                  });

                  createEnrolment(payload, {
                    onError: (error) =>
                      showServerErrors(
                        { error: JSON.parse(error.message) },
                        'enrolment'
                      ),
                    onSuccess: goToEnrolmentCompletedPage,
                  });
                } catch (e) {
                  goToCreateEnrolmentPage();
                }
              };

              return (
                <Form noValidate>
                  <FormikPersist
                    isSessionStorage={true}
                    name={`${FORM_NAMES.CREATE_ENROLMENT_FORM}-${registration.id}`}
                    savingDisabled={true}
                  />

                  <Divider />

                  <ReservationTimer
                    callbacksDisabled={
                      reservationTimerCallbacksDisabled.current
                    }
                    disableCallbacks={disableReservationTimerCallbacks}
                    initReservationData={false}
                    onDataNotFound={goToCreateEnrolmentPage}
                    registration={registration}
                  />
                  <Divider />
                  <Attendees />
                  <InformantInfo values={values} />
                  <ButtonWrapper>
                    <Button onClick={handleSubmit}>{t('buttonSend')}</Button>
                  </ButtonWrapper>
                </Form>
              );
            }}
          </Formik>
        </FormContainer>
      </Container>
    </MainContent>
  );
};

const SummaryPageWrapper: React.FC = () => {
  const { event, isLoading, registration } = useEventAndRegistrationData();

  return (
    <LoadingSpinner isLoading={isLoading}>
      {event && registration ? (
        <EnrolmentPageProvider>
          <EnrolmentServerErrorsProvider>
            <SummaryPage event={event} registration={registration} />
          </EnrolmentServerErrorsProvider>
        </EnrolmentPageProvider>
      ) : (
        <NotFound />
      )}
    </LoadingSpinner>
  );
};

export default SummaryPageWrapper;
