/* eslint-disable max-len */

import { useRouter } from 'next/router';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { MenuItemOptionProps } from '../../common/components/menuDropdown/types';
import PageWrapper from '../../common/components/pageWrapper/PageWrapper';
import useLocale from '../../hooks/useLocale';
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
import { getRegistrationActionButtonProps } from '../registration/utils';
import useUser from '../user/hooks/useUser';

import styles from './signupsPage.module.scss';
import SignupsPageMeta from './signupsPageMeta/SignupsPageMeta';
import SignupsPagePermissions from './signupsPagePermissions/SignupsPagePermissions';

interface AttendanceListPageProps {
  event: Event;
  registration: Registration;
}

const SignupsPage: React.FC<AttendanceListPageProps> = ({
  event,
  registration,
}) => {
  const { t } = useTranslation(['common', 'signups']);
  const locale = useLocale();
  const { user } = useUser();
  const router = useRouter();
  const { name } = getEventFields(event, locale);

  const goToAttendanceListPage = () => {
    router.push(
      ROUTES.ATTENDANCE_LIST.replace(
        '[registrationId]',
        registration.id as string
      )
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
          {/* <AttendeeList registration={registration} /> */}
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

  return (
    <SignupsPagePermissions
      event={event}
      isLoadingData={isLoadingEventOrRegistration}
      registration={registration}
    >
      <SignupsPage
        event={event as Event}
        registration={registration as Registration}
      />
    </SignupsPagePermissions>
  );
};

export default SignupsPageWrapper;