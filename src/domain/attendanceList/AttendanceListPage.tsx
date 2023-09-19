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
import RegistrationInfo from '../registration/registrationInfo/RegistrationInfo';
import { Registration } from '../registration/types';
import SignInRequired from '../signInRequired/SignInRequired';

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
    <PageWrapper
      backgroundColor="coatOfArms"
      className={styles.attendanceListPage}
    >
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

  if (!session) {
    return <SignInRequired />;
  }

  return (
    <LoadingSpinner isLoading={isLoadingEventOrRegistration}>
      {event && registration ? (
        <AttendanceListPage event={event} registration={registration} />
      ) : (
        <NotFound />
      )}
    </LoadingSpinner>
  );
};

export default AttendanceListPageWrapper;
