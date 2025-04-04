import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { MenuItemOptionProps } from '../../common/components/menuDropdown/types';
import { useNotificationsContext } from '../../common/components/notificationsContext/hooks/useNotificationsContext';
import PageWrapper from '../../common/components/pageWrapper/PageWrapper';
import useLocale from '../../hooks/useLocale';
import { ExtendedSession } from '../../types';
import getPublicRuntimeConfig from "../../utils/getPublicRuntimeConfig";
import Container from '../app/layout/container/Container';
import MainContent from '../app/layout/mainContent/MainContent';
import TitleRow from '../app/layout/titleRow/TitleRow';
import { ROUTES } from '../app/routes/constants';
import { Event } from '../event/types';
import { getEventFields } from '../event/utils';
import {
  REGISTRATION_ACTIONS,
  REGISTRATION_INCLUDES,
} from '../registration/constants';
import useEventAndRegistrationData from '../registration/hooks/useEventAndRegistrationData';
import RegistrationInfo from '../registration/registrationInfo/RegistrationInfo';
import { Registration } from '../registration/types';
import {
  exportSignupsAsExcel,
  getRegistrationActionButtonProps,
} from '../registration/utils';
import styles from '../singups/signupsPage.module.scss';
import SignupsPagePermissions from '../singups/signupsPagePermissions/SignupsPagePermissions';
import useUser from '../user/hooks/useUser';

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
  const { addNotification } = useNotificationsContext();
  const locale = useLocale();
  const { data: session } = useSession() as { data: ExtendedSession | null };
  const { user } = useUser();
  const router = useRouter();
  const { name } = getEventFields(event, locale);

  const goToSignupsPage = () => {
    router.push(ROUTES.SIGNUPS.replace('[registrationId]', registration.id));
  };

  const actionItems: MenuItemOptionProps[] = [
    getRegistrationActionButtonProps({
      action: REGISTRATION_ACTIONS.VIEW_SIGNUPS,
      onClick: goToSignupsPage,
      registration,
      t,
      user,
    }),
    getRegistrationActionButtonProps({
      action: REGISTRATION_ACTIONS.EXPORT_SIGNUPS_AS_EXCEL,
      onClick: () => {
        exportSignupsAsExcel({
          addNotification,
          registration,
          session,
          t,
          uiLanguage: locale,
        });
      },
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

  const { attendanceListLoginMethods } = getPublicRuntimeConfig();

  return (
    <SignupsPagePermissions
      event={event}
      isLoadingData={isLoadingEventOrRegistration}
      registration={registration}
      loginMethods={attendanceListLoginMethods}
    >
      <AttendanceListPage
        event={event as Event}
        registration={registration as Registration}
      />
    </SignupsPagePermissions>
  );
};

export default AttendanceListPageWrapper;
