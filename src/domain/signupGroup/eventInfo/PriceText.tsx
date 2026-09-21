import { useTranslation } from 'next-i18next/pages';
import React from 'react';

import useLocale from '../../../hooks/useLocale';
import getLocalisedString from '../../../utils/getLocalisedString';
import { Offer } from '../../event/types';

export interface PriceTextProps {
  freeEvent: boolean;
  offers: Offer[];
}

const PriceText: React.FC<PriceTextProps> = ({ freeEvent, offers }) => {
  const { t } = useTranslation('signup');
  const locale = useLocale();

  const getText = () => {
    return freeEvent
      ? t('event.freeEvent')
      : offers
          .map((offer) => getLocalisedString(offer.price, locale))
          .filter((t) => t)
          .join(', ') || '-';
  };
  return <>{getText()}</>;
};

export default PriceText;
