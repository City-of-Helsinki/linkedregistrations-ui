import { useField } from 'formik';
import { useTranslation } from 'next-i18next';
import React from 'react';

import { featureFlagUtils } from '../../../../utils/featureFlags';
import { Registration } from '../../../registration/types';
import { SIGNUP_GROUP_FIELDS } from '../../constants';
import TotalPrice from '../../totalPrice/TotalPrice';
import { SignupFormFields } from '../../types';

import Signup from './signup/Signup';
import styles from './signups.module.scss';

const getSignupPath = (index: number) =>
  `${SIGNUP_GROUP_FIELDS.SIGNUPS}[${index}]`;

type Props = {
  registration: Registration;
};

const Signups: React.FC<Props> = ({ registration }) => {
  const { t } = useTranslation('summary');

  const [{ value: signups }] = useField<SignupFormFields[]>({
    name: SIGNUP_GROUP_FIELDS.SIGNUPS,
  });

  return (
    <div className={styles.signups}>
      <h2>{t('signup.titleSignupsInfo')}</h2>
      {signups.map((signup, index) => {
        return (
          <Signup
            key={signup.id ?? `new-${index}`}
            registration={registration}
            signup={signup}
            signupPath={getSignupPath(index)}
          />
        );
      })}
      {featureFlagUtils.isFeatureEnabled('WEB_STORE_INTEGRATION') && (
        <TotalPrice registration={registration} signups={signups} />
      )}
    </div>
  );
};

export default Signups;
