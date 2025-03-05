import dynamic from 'next/dynamic';
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
import { REGISTRATION_ACTIONS } from '../registration/constants';
import useEventAndRegistrationData from '../registration/hooks/useEventAndRegistrationData';
import RegistrationInfo from '../registration/registrationInfo/RegistrationInfo';
import { Registration } from '../registration/types';
import {
  exportSignupsAsExcel,
  getRegistrationActionButtonProps,
} from '../registration/utils';
import useUser from '../user/hooks/useUser';

import SearchPanel from './searchPanel/SearchPanel';
import styles from './signupsPage.module.scss';
import SignupsPageMeta from './signupsPageMeta/SignupsPageMeta';
import SignupsPagePermissions from './signupsPagePermissions/SignupsPagePermissions';

// Lazy load SeatsCount to avoid conflict between client and server
const SignupsTable = dynamic(() => import('./signupsTable/SignupsTable'), {
  ssr: false,
});

interface AttendanceListPageProps {
  event: Event;
  registration: Registration;
}

const SignupsPage: React.FC<AttendanceListPageProps> = ({
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

  const goToAttendanceListPage = () => {
    router.push(
      ROUTES.ATTENDANCE_LIST.replace('[registrationId]', registration.id)
    );
  };

  const actionItems: MenuItemOptionProps[] = [
    getRegistrationActionButtonProps({
      action: REGISTRATION_ACTIONS.VIEW_ATTENDANCE_LIST,
      onClick: goToAttendanceListPage,
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
      <SignupsPageMeta event={event} />
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
          <SearchPanel />
          <SignupsTable
            caption={t('signups:signupsTableCaption')}
            registration={registration}
          />
        </Container>
      </MainContent>
    </PageWrapper>
  );
};

const SignupsPageWrapper: React.FC = () => {
  const {
    event,
    isLoading: isLoadingEventOrRegistration,
    registration,
  } = useEventAndRegistrationData();

  const { signupsLoginMethods } = getPublicRuntimeConfig();

  return (
    <SignupsPagePermissions
      event={event}
      isLoadingData={isLoadingEventOrRegistration}
      registration={registration}
      loginMethods={signupsLoginMethods}
    >
      <SignupsPage
        event={event as Event}
        registration={registration as Registration}
      />
    </SignupsPagePermissions>
  );
};

export default SignupsPageWrapper;
