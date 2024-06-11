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
import { useSignupGroupQuery } from '../signupGroup/query';
import SignupGroupForm from '../signupGroup/signupGroupForm/SignupGroupForm';
import { SignupGroupFormProvider } from '../signupGroup/signupGroupFormContext/SignupGroupFormContext';
import { SignupGroup } from '../signupGroup/types';

import useSignupData from './hooks/useSignupData';
import SignupPageMeta from './signupPageMeta/SignupPageMeta';
import { SignupServerErrorsProvider } from './signupServerErrorsContext/SignupServerErrorsContext';
import { Signup } from './types';
import { getSignupGroupInitialValuesFromSignup } from './utils';

type Props = {
  event: Event;
  registration: Registration;
  signup: Signup;
  signupGroup?: SignupGroup;
};

const EditSignupPage: React.FC<Props> = ({
  event,
  registration,
  signup,
  signupGroup,
}) => {
  const initialValues = getSignupGroupInitialValuesFromSignup(
    signup,
    signupGroup
  );

  return (
    <MainContent>
      <SignupPageMeta event={event} />
      <SignupGroupForm
        contactPersonFieldsDisabled={!!signup.signup_group}
        event={event}
        initialValues={initialValues}
        mode="update-signup"
        registration={registration}
        signup={signup}
        signupGroup={signupGroup}
      />
    </MainContent>
  );
};

const EditSignupPageWrapper: React.FC = () => {
  const {
    event,
    isLoading: isLoadingEventOrRegistration,
    registration,
  } = useEventAndRegistrationData();
  const { isLoading: isLoadingSignup, signup } = useSignupData();
  const { data: session } = useSession() as {
    data: ExtendedSession | null;
  };
  const { data: signupGroup, isLoading: isLoadingSignupGroup } =
    useSignupGroupQuery({
      args: { id: signup?.signup_group as string },
      options: { enabled: !!signup?.signup_group },
      session,
    });

  if (!session) {
    return <SignInRequired />;
  }

  return (
    <LoadingSpinner
      isLoading={
        isLoadingSignup || isLoadingEventOrRegistration || isLoadingSignupGroup
      }
    >
      {event && registration && signup ? (
        <SignupGroupFormProvider registration={registration}>
          <SignupServerErrorsProvider>
            <EditSignupPage
              event={event}
              registration={registration}
              signup={signup}
              signupGroup={signupGroup}
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
