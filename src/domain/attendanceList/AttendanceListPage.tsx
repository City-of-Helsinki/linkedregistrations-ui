/* eslint-disable max-len */

import { useSession } from 'next-auth/react';
import React from 'react';

import LoadingSpinner from '../../common/components/loadingSpinner/LoadingSpinner';
import PageWrapper from '../../common/components/pageWrapper/PageWrapper';
import { ExtendedSession } from '../../types';
import Container from '../app/layout/container/Container';
import MainContent from '../app/layout/mainContent/MainContent';
import { Event } from '../event/types';
import NotFound from '../notFound/NotFound';
import { REGISTRATION_INCLUDES } from '../registration/constants';
import useEventAndRegistrationData from '../registration/hooks/useEventAndRegistrationData';
import { canUserUpdateSignupPresenceStatus } from '../registration/permissions';
import RegistrationInfo from '../registration/registrationInfo/RegistrationInfo';
import { Registration } from '../registration/types';
import SignInRequired from '../signInRequired/SignInRequired';
import StrongIdentificationRequired from '../strongIdentificationRequired/StrongIdentificationRequired';
import { useUserQuery } from '../user/query';

import styles from './attendanceListPage.module.scss';
import AttendanceListPageMeta from './attendanceListPageMeta/AttendanceListPageMeta';
import AttendeeList from './attendeeList/AttendeeList';

interface AttendanceListPageProps {
  event: Event;
  registration: Registration;
}

const AttendanceListPage: React.FC<AttendanceListPageProps> = ({
  event,
  registration,
}) => {
  return (
    <PageWrapper backgroundColor="coatOfArms">
      <AttendanceListPageMeta event={event} />
      <MainContent>
        <Container
          contentWrapperClassName={styles.pageContentContainer}
          withOffset
        >
          <RegistrationInfo event={event} />
          <AttendeeList registration={registration} />
        </Container>
      </MainContent>
    </PageWrapper>
  );
};

const AttendanceListPageWrapper: React.FC = () => {
  const {
    event,
    isLoading: isLoadingEventOrRegistration,
    registration,
  } = useEventAndRegistrationData({
    overrideRegistrationsVariables: {
      include: [...REGISTRATION_INCLUDES, 'signups'],
    },
  });

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

    // Show strong identification required page if user doesn't have permissions to edit signups
    if (!user?.is_strongly_identified) {
      return <StrongIdentificationRequired />;
    }

    // Show not found page if user doesn't have permissions to edit signups
    if (!canUserUpdateSignupPresenceStatus({ registration, user })) {
      return <NotFound />;
    }

    if (event && registration) {
      return <AttendanceListPage event={event} registration={registration} />;
    }

    return <NotFound />;
  };

  return (
    <LoadingSpinner
      isLoading={
        isLoadingEventOrRegistration || (enableUserRequest && isLoadingUser)
      }
    >
      {getPageComponent()}
    </LoadingSpinner>
  );
};

export default AttendanceListPageWrapper;
