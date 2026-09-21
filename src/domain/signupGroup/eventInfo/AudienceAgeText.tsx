import { useTranslation } from 'next-i18next/pages';
import React from 'react';

export interface AudienceAgeTextProps {
  maxAge: number | null;
  minAge: number | null;
}

const AudienceAgeText: React.FC<AudienceAgeTextProps> = ({
  maxAge,
  minAge,
}) => {
  const { t } = useTranslation('signup');
  const getText = () => {
    if (maxAge && minAge) {
      return t('event.audienceAge.between', { max: maxAge, min: minAge });
    } else if (maxAge) {
      return t('event.audienceAge.under', { max: maxAge });
    } else if (minAge) {
      return t('event.audienceAge.over', { min: minAge });
    }
    return t('event.audienceAge.noAgeLimit');
  };

  return <>{getText()}</>;
};

export default AudienceAgeText;
