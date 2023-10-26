import { useSession } from 'next-auth/react';
import { PropsWithChildren } from 'react';

import LoadingSpinner from '../../../common/components/loadingSpinner/LoadingSpinner';
import { ExtendedSession } from '../../../types';
import { Event } from '../../event/types';
import InsufficientPermissions from '../../insufficientPermissions/InsufficientPermissions';
import NotFound from '../../notFound/NotFound';
import { hasRegistrationUserAccess } from '../../registration/permissions';
import { Registration } from '../../registration/types';
import SignInRequired from '../../signInRequired/SignInRequired';
import StrongIdentificationRequired from '../../strongIdentificationRequired/StrongIdentificationRequired';
import { useUserQuery } from '../../user/query';

type Props = {
  event?: Event;
  isLoadingData: boolean;
  registration?: Registration;
};
const SignupsPagePermissions: React.FC<PropsWithChildren<Props>> = ({
  children,
  event,
  isLoadingData,
  registration,
}) => {
  const { data: session } = useSession() as {
    data: ExtendedSession | null;
  };

  const userId = session?.user?.id ?? '';
  const linkedEventsApiToken = session?.apiTokens?.linkedevents;
  const enableUserRequest = Boolean(userId && linkedEventsApiToken);

  const { data: user, isLoading: isLoadingUser } = useUserQuery({
    args: { username: userId },
    options: { enabled: enableUserRequest },
    session,
  });

  const getPageComponent = () => {
    // Show sign in required page if user is not authenticated
    if (!session) {
      return <SignInRequired />;
    }

    if (!registration || !event) {
      return <NotFound />;
    }

    // Show strong identification required page if user doesn't have permissions to edit signups
    if (!user?.is_strongly_identified) {
      return <StrongIdentificationRequired />;
    }

    // Show insufficient permissions page if user doesn't have permissions to edit signup presence status
    if (!hasRegistrationUserAccess({ registration, user })) {
      return <InsufficientPermissions />;
    }

    return children;
  };

  return (
    <LoadingSpinner
      isLoading={isLoadingData || (enableUserRequest && isLoadingUser)}
    >
      {getPageComponent()}
    </LoadingSpinner>
  );
};

export default SignupsPagePermissions;
