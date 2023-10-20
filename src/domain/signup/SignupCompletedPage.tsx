import LoadingSpinner from '../../common/components/loadingSpinner/LoadingSpinner';
import NotFound from '../notFound/NotFound';
import useEventAndRegistrationData from '../registration/hooks/useEventAndRegistrationData';
import { SignupCompletedPage } from '../signupGroup/SignupGroupCompletedPage';

import { ATTENDEE_STATUS } from './constants';
import useSignupData from './hooks/useSignupData';

const SignupGroupCompletedPageWrapper: React.FC = () => {
  const { event, isLoading, registration } = useEventAndRegistrationData();
  const { isLoading: isLoadingSignup, signup } = useSignupData();

  return (
    <LoadingSpinner isLoading={isLoading || isLoadingSignup}>
      {event && registration && signup ? (
        <SignupCompletedPage
          event={event}
          inWaitingList={signup.attendee_status == ATTENDEE_STATUS.Waitlisted}
          registration={registration}
        />
      ) : (
        <NotFound />
      )}
    </LoadingSpinner>
  );
};

export default SignupGroupCompletedPageWrapper;
