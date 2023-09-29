import { useField } from 'formik';
import { useTranslation } from 'next-i18next';
import React from 'react';

import { SIGNUP_GROUP_FIELDS } from '../../constants';
import { SignupFormFields } from '../../types';

import Signup from './signup/Signup';
import styles from './signups.module.scss';

const getSignupPath = (index: number) =>
  `${SIGNUP_GROUP_FIELDS.SIGNUPS}[${index}]`;

const Signups: React.FC = () => {
  const { t } = useTranslation('summary');

  const [{ value: signups }] = useField<SignupFormFields[]>({
    name: SIGNUP_GROUP_FIELDS.SIGNUPS,
  });

  return (
    <div className={styles.signups}>
      <h2>{t('titleSignupsInfo')}</h2>
      {signups.map((signup, index) => {
        return (
          <Signup
            key={index}
            signup={signup}
            signupPath={getSignupPath(index)}
          />
        );
      })}
    </div>
  );
};

export default Signups;
