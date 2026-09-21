import { useTranslation } from 'next-i18next/pages';
import React from 'react';

import ErrorPageWithLogoutButton from '../../common/components/errorPageWithLogoutButton/ErrorPageWithLogoutButton';

const InsufficientPermissions: React.FC = () => {
  const { t } = useTranslation('common');
  const text = t('insufficientPermissions.text');
  const title = t('insufficientPermissions.title');

  return <ErrorPageWithLogoutButton text={text} title={title} />;
};

export default InsufficientPermissions;
