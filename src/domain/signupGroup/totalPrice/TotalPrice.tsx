import { useTranslation } from 'next-i18next/pages';
import { FC } from 'react';

import { Registration } from '../../registration/types';
import useSignupPriceGroupOptions from '../hooks/useSignupPriceGroupOptions';
import { SignupFormFields } from '../types';
import { calculateTotalPrice } from '../utils';

import styles from './totalPrice.module.scss';

export type TotalPriceProps = {
  registration: Registration;
  signups: SignupFormFields[];
};

const TotalPrice: FC<TotalPriceProps> = ({ registration, signups }) => {
  const { t } = useTranslation('common');
  const priceGroupOptions = useSignupPriceGroupOptions(registration);
  const sum = calculateTotalPrice(priceGroupOptions, signups);

  return priceGroupOptions.length ? (
    <div className={styles.totalPrice}>
      <strong>
        {t('common:total')} {sum.toFixed(2).replace('.', ',')} €
      </strong>
    </div>
  ) : null;
};

export default TotalPrice;
