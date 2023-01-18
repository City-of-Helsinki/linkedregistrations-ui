import { useRouter } from 'next/router';
import React from 'react';

import LoadingSpinner from '../../common/components/loadingSpinner/LoadingSpinner';
import Container from '../app/layout/container/Container';
import MainContent from '../app/layout/mainContent/MainContent';
import { EVENT_INCLUDES } from '../event/constants';
import { useEventQuery } from '../event/query';
import { Event } from '../event/types';
import NotFound from '../notFound/NotFound';
import { useRegistrationQuery } from '../registration/query';
import { Registration } from '../registration/types';
import EditEnrolmentPageMeta from './editEnrolmentPageMeta/EditEnrolmentPageMeta';
import EnrolmentForm from './enrolmentForm/EnrolmentForm';
import { EnrolmentPageProvider } from './enrolmentPageContext/EnrolmentPageContext';
import { EnrolmentServerErrorsProvider } from './enrolmentServerErrorsContext/EnrolmentServerErrorsContext';
import EventInfo from './eventInfo/EventInfo';
import FormContainer from './formContainer/FormContainer';
import { useEnrolmentQuery } from './query';
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
      <EditEnrolmentPageMeta event={event} />
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
    data: registration,
    isFetching: isFetchingRegistration,
    status: statusRegistration,
  } = useRegistrationQuery(
    { id: query.registrationId as string },
    { enabled: !!query.registrationId }
  );

  const {
    data: event,
    isFetching: isFetchingEvent,
    status: statusEvent,
  } = useEventQuery(
    { id: registration?.event as string, include: EVENT_INCLUDES },
    { enabled: !!registration?.event }
  );

  const {
    data: enrolment,
    isFetching: isFetchingEnrolment,
    status: statusEnrolment,
  } = useEnrolmentQuery({
    cancellationCode: query.accessCode as string,
  });

  return (
    <LoadingSpinner
      isLoading={
        // istanbul ignore next
        (statusEnrolment === 'loading' && isFetchingEnrolment) ||
        (statusEvent === 'loading' && isFetchingEvent) ||
        (statusRegistration === 'loading' && isFetchingRegistration)
      }
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
