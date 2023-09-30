/* eslint-disable max-len */
import { useSession } from 'next-auth/react';
import React from 'react';

import LoadingSpinner from '../../common/components/loadingSpinner/LoadingSpinner';
import { ExtendedSession } from '../../types';
import Container from '../app/layout/container/Container';
import MainContent from '../app/layout/mainContent/MainContent';
// eslint-disable-next-line max-len
import { Event } from '../event/types';
import NotFound from '../notFound/NotFound';
import useEventAndRegistrationData from '../registration/hooks/useEventAndRegistrationData';
import { Registration } from '../registration/types';
import SignupPageMeta from '../signup/signupPageMeta/SignupPageMeta';
import { SignupServerErrorsProvider } from '../signup/signupServerErrorsContext/SignupServerErrorsContext';

import AuthenticationRequiredNotification from './authenticationRequiredNotification/AuthenticationRequiredNotification';
import EventInfo from './eventInfo/EventInfo';
import FormContainer from './formContainer/FormContainer';
import SignupGroupForm from './signupGroupForm/SignupGroupForm';
import { SignupGroupFormProvider } from './signupGroupFormContext/SignupGroupFormContext';
import { getSignupGroupDefaultInitialValues } from './utils';

type Props = {
  event: Event;
  registration: Registration;
};

const CreateSignupGroupPage: React.FC<Props> = ({ event, registration }) => {
  const initialValues = getSignupGroupDefaultInitialValues();
  const { data: session } = useSession() as {
    data: ExtendedSession | null;
  };

  return (
    <MainContent>
      <SignupPageMeta event={event} />
      {!session && (
        <Container withOffset>
          <FormContainer>
            {<AuthenticationRequiredNotification />}
            <EventInfo event={event} registration={registration} />
          </FormContainer>
        </Container>
      )}

      {session && (
        <SignupGroupForm
          event={event}
          initialValues={initialValues}
          mode="create-signup-group"
          registration={registration}
        />
      )}
    </MainContent>
  );
};

const CreateSignupGroupPageWrapper: React.FC = () => {
  const { event, isLoading, registration } = useEventAndRegistrationData();

  return (
    <LoadingSpinner isLoading={isLoading}>
      {registration && event ? (
        <SignupGroupFormProvider>
          <SignupServerErrorsProvider>
            <CreateSignupGroupPage event={event} registration={registration} />
          </SignupServerErrorsProvider>
        </SignupGroupFormProvider>
      ) : (
        <NotFound />
      )}
    </LoadingSpinner>
  );
};

export default CreateSignupGroupPageWrapper;
