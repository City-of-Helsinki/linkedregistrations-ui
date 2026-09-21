import { useTranslation } from 'next-i18next/pages';
import React from 'react';

import ErrorTemplate from '../../../common/components/errorTemplate/ErrorTemplate';
import MainContent from '../../app/layout/mainContent/MainContent';
import { Event } from '../../event/types';
import SignupPageMeta from '../../signup/signupPageMeta/SignupPageMeta';

type Props = {
  event: Event;
};

const SignupIsEnded: React.FC<Props> = ({ event }) => {
  const { t } = useTranslation('signup');

  return (
    <MainContent>
      <SignupPageMeta event={event} />
      <ErrorTemplate title={t('signupIsEnded')} />
    </MainContent>
  );
};

export default SignupIsEnded;
