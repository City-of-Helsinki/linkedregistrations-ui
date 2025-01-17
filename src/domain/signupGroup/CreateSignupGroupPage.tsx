/* eslint-disable max-len */
import { useSession } from 'next-auth/react';
import React from 'react';

import LoadingSpinner from '../../common/components/loadingSpinner/LoadingSpinner';
import { ExtendedSession } from '../../types';
import Container from '../app/layout/container/Container';
import MainContent from '../app/layout/mainContent/MainContent';
import { Event } from '../event/types';
import NotFound from '../notFound/NotFound';
import useEventAndRegistrationData from '../registration/hooks/useEventAndRegistrationData';
import { Registration } from '../registration/types';
import { isSignupEnded } from '../registration/utils';
import SignupPageMeta from '../signup/signupPageMeta/SignupPageMeta';
import { SignupServerErrorsProvider } from '../signup/signupServerErrorsContext/SignupServerErrorsContext';

import AuthenticationRequiredNotification from './authenticationRequiredNotification/AuthenticationRequiredNotification';
import Divider from './divider/Divider';
import EventInfo from './eventInfo/EventInfo';
import FormContainer from './formContainer/FormContainer';
import RegistrationWarning from './registrationWarning/RegistrationWarning';
import SignupGroupForm from './signupGroupForm/SignupGroupForm';
import { SignupGroupFormProvider } from './signupGroupFormContext/SignupGroupFormContext';
import SignupIsEnded from './signupIsEnded/SignupIsEnded';
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
            <AuthenticationRequiredNotification />
            <RegistrationWarning registration={registration} />
            <EventInfo event={event} registration={registration} />
            <Divider />
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
        <>
          {isSignupEnded(registration) ? (
            <SignupIsEnded event={event} />
          ) : (
            <SignupGroupFormProvider registration={registration}>
              <SignupServerErrorsProvider>
                <CreateSignupGroupPage
                  event={event}
                  registration={registration}
                />
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

export default CreateSignupGroupPageWrapper;
