import { useSession } from 'next-auth/react';
import React from 'react';

import LoadingSpinner from '../../common/components/loadingSpinner/LoadingSpinner';
import { ExtendedSession } from '../../types';
import MainContent from '../app/layout/mainContent/MainContent';
import { Event } from '../event/types';
import NotFound from '../notFound/NotFound';
import useEventAndRegistrationData from '../registration/hooks/useEventAndRegistrationData';
import { Registration } from '../registration/types';
import SignInRequired from '../signInRequired/SignInRequired';
import SignupGroupForm from '../signupGroup/signupGroupForm/SignupGroupForm';
import { SignupGroupFormProvider } from '../signupGroup/signupGroupFormContext/SignupGroupFormContext';

import useSignupData from './hooks/useSignupData';
import SignupPageMeta from './signupPageMeta/SignupPageMeta';
import { SignupServerErrorsProvider } from './signupServerErrorsContext/SignupServerErrorsContext';
import { Signup } from './types';
import { getSignupGroupInitialValuesFromSignup } from './utils';

type Props = {
  event: Event;
  registration: Registration;
  signup: Signup;
};

const EditSignupPage: React.FC<Props> = ({ event, registration, signup }) => {
  const initialValues = getSignupGroupInitialValuesFromSignup(signup);

  return (
    <MainContent>
      <SignupPageMeta event={event} />
      <SignupGroupForm
        event={event}
        initialValues={initialValues}
        readOnly={true}
        registration={registration}
        signup={signup}
      />
    </MainContent>
  );
};

const EditSignupPageWrapper: React.FC = () => {
  const {
    event,
    isLoading: isLoadingEventOrReigstration,
    registration,
  } = useEventAndRegistrationData();
  const { isLoading: isLoadingSignup, signup } = useSignupData();
  const { data: session } = useSession() as {
    data: ExtendedSession | null;
  };

  if (!session) {
    return <SignInRequired />;
  }

  return (
    <LoadingSpinner isLoading={isLoadingSignup || isLoadingEventOrReigstration}>
      {event && registration && signup ? (
        <SignupGroupFormProvider>
          <SignupServerErrorsProvider>
            <EditSignupPage
              event={event}
              registration={registration}
              signup={signup}
            />
          </SignupServerErrorsProvider>
        </SignupGroupFormProvider>
      ) : (
        <NotFound />
      )}
    </LoadingSpinner>
  );
};

export default EditSignupPageWrapper;
