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
import CreateEnrolmentPageMeta from './createEnrolmentPageMeta/CreateEnrolmentPageMeta';
import EnrolmentForm from './enrolmentForm/EnrolmentForm';
import { EnrolmentPageProvider } from './enrolmentPageContext/EnrolmentPageContext';
import { EnrolmentServerErrorsProvider } from './enrolmentServerErrorsContext/EnrolmentServerErrorsContext';
import EventInfo from './eventInfo/EventInfo';
import FormContainer from './formContainer/FormContainer';
import { getEnrolmentDefaultInitialValues } from './utils';

type Props = {
  event: Event;
  registration: Registration;
};

const CreateEnrolmentPage: React.FC<Props> = ({ event, registration }) => {
  const initialValues = getEnrolmentDefaultInitialValues(registration);

  return (
    <MainContent>
      <CreateEnrolmentPageMeta event={event} />
      <Container withOffset>
        <FormContainer>
          <EventInfo event={event} registration={registration} />

          <EnrolmentForm
            initialValues={initialValues}
            registration={registration}
          />
        </FormContainer>
      </Container>
    </MainContent>
  );
};

const CreateEnrolmentPageWrapper: React.FC = () => {
  const router = useRouter();
  const { query } = router;

  const {
    data: registration,
    isFetching: isFetchingRegistration,
    status: statusRegistration,
  } = useRegistrationQuery(
    { id: query.registrationId as string },
    { enabled: !!query.registrationId, retry: 0 }
  );

  const {
    data: event,
    isFetching: isFetchingEvent,
    status: statusEvent,
  } = useEventQuery(
    {
      id: registration?.event as string,
      include: EVENT_INCLUDES,
    },
    { enabled: !!registration?.event }
  );

  console.log('DUMMY CONSOLE LOG TO TEST COVERAGE REPORT');
  console.log('SECOND DUMMY CONSOLE LOG TO TEST COVERAGE REPORT');
  console.log('3RD DUMMY CONSOLE LOG TO TEST COVERAGE REPORT');

  return (
    <LoadingSpinner
      isLoading={
        (statusRegistration === 'loading' && isFetchingRegistration) ||
        (statusEvent === 'loading' && isFetchingEvent)
      }
    >
      {registration && event ? (
        <EnrolmentPageProvider>
          <EnrolmentServerErrorsProvider>
            <CreateEnrolmentPage event={event} registration={registration} />
          </EnrolmentServerErrorsProvider>
        </EnrolmentPageProvider>
      ) : (
        <NotFound />
      )}
    </LoadingSpinner>
  );
};

export default CreateEnrolmentPageWrapper;
