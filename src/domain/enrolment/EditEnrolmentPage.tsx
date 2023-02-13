import { useRouter } from 'next/router';
import React from 'react';

import LoadingSpinner from '../../common/components/loadingSpinner/LoadingSpinner';
import Container from '../app/layout/container/Container';
import MainContent from '../app/layout/mainContent/MainContent';
import { Event } from '../event/types';
import NotFound from '../notFound/NotFound';
import { Registration } from '../registration/types';
import EnrolmentForm from './enrolmentForm/EnrolmentForm';
import { EnrolmentPageProvider } from './enrolmentPageContext/EnrolmentPageContext';
import EnrolmentPageMeta from './enrolmentPageMeta/EnrolmentPageMeta';
import { EnrolmentServerErrorsProvider } from './enrolmentServerErrorsContext/EnrolmentServerErrorsContext';
import EventInfo from './eventInfo/EventInfo';
import FormContainer from './formContainer/FormContainer';
import useEnrolmentData from './hooks/useEnrolmentData';
import useEventAndRegistrationData from './hooks/useEventAndRegistrationData';
import { Enrolment } from './types';
import { getEnrolmentInitialValues } from './utils';

type Props = {
  cancellationCode: string;
  enrolment: Enrolment;
  event: Event;
  registration: Registration;
};

const EditEnrolmentPage: React.FC<Props> = ({
  cancellationCode,
  enrolment,
  event,
  registration,
}) => {
  const initialValues = getEnrolmentInitialValues(enrolment, registration);
  return (
    <MainContent>
      <EnrolmentPageMeta event={event} />
      <Container withOffset>
        <FormContainer>
          <EventInfo event={event} registration={registration} />

          <EnrolmentForm
            cancellationCode={cancellationCode}
            initialValues={initialValues}
            readOnly={true}
            registration={registration}
          />
        </FormContainer>
      </Container>
    </MainContent>
  );
};

const EditEnrolmentPageWrapper: React.FC = () => {
  const { query } = useRouter();
  const {
    event,
    isLoading: isLoadingEventOrReigstration,
    registration,
  } = useEventAndRegistrationData();
  const { enrolment, isLoading: isLoadingEnrolment } = useEnrolmentData();

  return (
    <LoadingSpinner
      isLoading={isLoadingEnrolment || isLoadingEventOrReigstration}
    >
      {enrolment && event && registration ? (
        <EnrolmentPageProvider>
          <EnrolmentServerErrorsProvider>
            <EditEnrolmentPage
              cancellationCode={query.accessCode as string}
              enrolment={enrolment}
              event={event}
              registration={registration}
            />
          </EnrolmentServerErrorsProvider>
        </EnrolmentPageProvider>
      ) : (
        <NotFound />
      )}
    </LoadingSpinner>
  );
};

export default EditEnrolmentPageWrapper;
