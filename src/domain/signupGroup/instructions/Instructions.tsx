import { useTranslation } from 'next-i18next';
import React from 'react';

import useLocale from '../../../hooks/useLocale';
import { Registration } from '../../registration/types';
import { getRegistrationFields } from '../../registration/utils';

type Props = {
  registration: Registration;
};

const Instructions: React.FC<Props> = ({ registration }) => {
  const { t } = useTranslation(['signup']);
  const locale = useLocale();
  const { instructions } = getRegistrationFields(registration, locale);
  const instructionsParts = instructions.split('\n');

  if (!instructions) {
    return null;
  }

  return (
    <>
      <strong>{t('signup:instructions')}</strong>
      {instructionsParts.map((part) => (
        <p key={part}>{part}</p>
      ))}
    </>
  );
};

export default Instructions;
