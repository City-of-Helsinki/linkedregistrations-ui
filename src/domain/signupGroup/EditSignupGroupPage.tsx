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
import SignupPageMeta from '../signup/signupPageMeta/SignupPageMeta';
import { SignupServerErrorsProvider } from '../signup/signupServerErrorsContext/SignupServerErrorsContext';
import SignupGroupForm from '../signupGroup/signupGroupForm/SignupGroupForm';
import { SignupGroupFormProvider } from '../signupGroup/signupGroupFormContext/SignupGroupFormContext';
import { getSignupGroupInitialValues } from '../signupGroup/utils';

import useSignupGroupData from './hooks/useSignupGroupData';
import { SignupGroup } from './types';

type Props = {
  event: Event;
  registration: Registration;
  signupGroup: SignupGroup;
};

const EditSignupGroupPage: React.FC<Props> = ({
  event,
  registration,
  signupGroup,
}) => {
  const initialValues = getSignupGroupInitialValues(signupGroup);

  return (
    <MainContent>
      <SignupPageMeta event={event} />
      <SignupGroupForm
        event={event}
        initialValues={initialValues}
        mode="update-signup-group"
        registration={registration}
        signupGroup={signupGroup}
      />
    </MainContent>
  );
};

const EditSignupGroupPageWrapper: React.FC = () => {
  const {
    event,
    isLoading: isLoadingEventOrReigstration,
    registration,
  } = useEventAndRegistrationData();
  const { isLoading: isLoadingSignup, signupGroup } = useSignupGroupData();
  const { data: session } = useSession() as {
    data: ExtendedSession | null;
  };

  if (!session) {
    return <SignInRequired />;
  }

  return (
    <LoadingSpinner isLoading={isLoadingSignup || isLoadingEventOrReigstration}>
      {event && registration && signupGroup ? (
        <SignupGroupFormProvider>
          <SignupServerErrorsProvider>
            <EditSignupGroupPage
              event={event}
              registration={registration}
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

export default EditSignupGroupPageWrapper;
