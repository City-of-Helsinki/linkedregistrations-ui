/* eslint-disable max-len */

import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import LoadingSpinner from '../../common/components/loadingSpinner/LoadingSpinner';
import { MenuItemOptionProps } from '../../common/components/menuDropdown/types';
import PageWrapper from '../../common/components/pageWrapper/PageWrapper';
import useLocale from '../../hooks/useLocale';
import { ExtendedSession } from '../../types';
import Container from '../app/layout/container/Container';
import MainContent from '../app/layout/mainContent/MainContent';
import TitleRow from '../app/layout/titleRow/TitleRow';
import { ROUTES } from '../app/routes/constants';
import { Event } from '../event/types';
import { getEventFields } from '../event/utils';
import NotFound from '../notFound/NotFound';
import {
  REGISTRATION_ACTIONS,
  REGISTRATION_INCLUDES,
} from '../registration/constants';
import useEventAndRegistrationData from '../registration/hooks/useEventAndRegistrationData';
import { hasRegistrationUserAccess } from '../registration/permissions';
import RegistrationInfo from '../registration/registrationInfo/RegistrationInfo';
import { Registration } from '../registration/types';
import { getRegistrationActionButtonProps } from '../registration/utils';
import SignInRequired from '../signInRequired/SignInRequired';
import StrongIdentificationRequired from '../strongIdentificationRequired/StrongIdentificationRequired';
import useUser from '../user/hooks/useUser';
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
  const { t } = useTranslation(['common', 'signups']);
  const locale = useLocale();
  const { user } = useUser();
  const router = useRouter();
  const { name } = getEventFields(event, locale);

  const goToSignupsPage = () => {
    router.push(
      ROUTES.SIGNUPS.replace('[registrationId]', registration.id as string)
    );
  };

  const actionItems: MenuItemOptionProps[] = [
    getRegistrationActionButtonProps({
      action: REGISTRATION_ACTIONS.VIEW_SIGNUPS,
      onClick: goToSignupsPage,
      registration,
      t,
      user,
    }),
  ];

  return (
    <PageWrapper backgroundColor="coatOfArms">
      <AttendanceListPageMeta event={event} />
      <MainContent>
        <Container
          contentWrapperClassName={styles.pageContentContainer}
          withOffset
        >
          <TitleRow
            actionItems={actionItems}
            editingInfo={<RegistrationInfo event={event} />}
            title={name}
          />
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
    if (!hasRegistrationUserAccess({ registration, user })) {
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
