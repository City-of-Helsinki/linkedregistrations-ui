import { useTranslation } from 'next-i18next/pages';
import React from 'react';

import ErrorPageWithLogoutButton from '../../common/components/errorPageWithLogoutButton/ErrorPageWithLogoutButton';

const StrongIdentificationRequired: React.FC = () => {
  const { t } = useTranslation('common');
  const text = t('strongIdentificationRequired.text');
  const title = t('strongIdentificationRequired.title');

  return <ErrorPageWithLogoutButton text={text} title={title} />;
};

export default StrongIdentificationRequired;
