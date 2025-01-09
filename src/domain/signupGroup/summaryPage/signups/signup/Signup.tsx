import { IconSize, IconUser } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';

import FormGroup from '../../../../../common/components/formGroup/FormGroup';
import SplittedRow from '../../../../../common/components/splittedRow/SplittedRow';
import TextArea from '../../../../../common/components/textArea/TextArea';
import { featureFlagUtils } from '../../../../../utils/featureFlags';
import { Registration } from '../../../../registration/types';
import { SIGNUP_FIELDS } from '../../../constants';
import Divider from '../../../divider/Divider';
import useSignupPriceGroupOptions from '../../../hooks/useSignupPriceGroupOptions';
import InWaitingListInfo from '../../../inWaitingListInfo/InWaitingListInfo';
import { SignupFormFields } from '../../../types';
import {
  isDateOfBirthFieldRequired,
  isSignupFieldRequired,
} from '../../../utils';
import ReadOnlyTextInput from '../../readOnlyTextInput/ReadOnlyTextInput';

import styles from './signup.module.scss';

export type SignupProps = {
  registration: Registration;
  signup: SignupFormFields;
  signupPath: string;
};

const Signup: React.FC<SignupProps> = ({
  registration,
  signup,
  signupPath,
}) => {
  const { t } = useTranslation('summary');

  const priceGroupOptions = useSignupPriceGroupOptions(registration);
  const priceGroupText = priceGroupOptions?.find(
    (o) => o.value === signup.priceGroup
  )?.label;

  const getFieldId = (field: string) => `${signupPath}.${field}`;

  const getFieldText = (value: string) => value || '-';

  return (
    <div>
      <Divider />
      <div className={styles.iconRow}>
        <IconUser aria-hidden className={styles.icon} size={IconSize.Medium} />
        {featureFlagUtils.isFeatureEnabled('WEB_STORE_INTEGRATION') &&
          priceGroupText &&
          [priceGroupText, signup.inWaitingList ? ' — ' : ''].join('')}
        {signup.inWaitingList && <InWaitingListInfo />}
      </div>
      {(isSignupFieldRequired(registration, SIGNUP_FIELDS.FIRST_NAME) ||
        isSignupFieldRequired(registration, SIGNUP_FIELDS.LAST_NAME)) && (
        <FormGroup>
          <SplittedRow>
            {isSignupFieldRequired(registration, SIGNUP_FIELDS.FIRST_NAME) && (
              <ReadOnlyTextInput
                id={getFieldId(SIGNUP_FIELDS.FIRST_NAME)}
                label={t(`signup.labelFirstName`)}
                value={getFieldText(signup.firstName)}
              />
            )}
            {isSignupFieldRequired(registration, SIGNUP_FIELDS.LAST_NAME) && (
              <ReadOnlyTextInput
                id={getFieldId(SIGNUP_FIELDS.LAST_NAME)}
                label={t(`signup.labelLastName`)}
                value={getFieldText(signup.lastName)}
              />
            )}
          </SplittedRow>
        </FormGroup>
      )}

      {isSignupFieldRequired(registration, SIGNUP_FIELDS.PHONE_NUMBER) && (
        <FormGroup>
          <SplittedRow>
            <ReadOnlyTextInput
              id={getFieldId(SIGNUP_FIELDS.PHONE_NUMBER)}
              label={t(`signup.labelPhoneNumber`)}
              value={getFieldText(signup.phoneNumber)}
            />
          </SplittedRow>
        </FormGroup>
      )}

      {(isSignupFieldRequired(registration, SIGNUP_FIELDS.STREET_ADDRESS) ||
        isDateOfBirthFieldRequired(registration)) && (
        <FormGroup>
          <SplittedRow className={styles.streetAddressRow}>
            {isDateOfBirthFieldRequired(registration) && (
              <ReadOnlyTextInput
                id={getFieldId(SIGNUP_FIELDS.DATE_OF_BIRTH)}
                label={t(`signup.labelDateOfBirth`)}
                value={getFieldText(signup.dateOfBirth)}
              />
            )}
            {isSignupFieldRequired(
              registration,
              SIGNUP_FIELDS.STREET_ADDRESS
            ) && (
              <ReadOnlyTextInput
                id={getFieldId(SIGNUP_FIELDS.STREET_ADDRESS)}
                label={t(`signup.labelStreetAddress`)}
                value={getFieldText(signup.streetAddress)}
              />
            )}
          </SplittedRow>
        </FormGroup>
      )}
      {(isSignupFieldRequired(registration, SIGNUP_FIELDS.ZIPCODE) ||
        isSignupFieldRequired(registration, SIGNUP_FIELDS.CITY)) && (
        <FormGroup>
          <SplittedRow>
            {isSignupFieldRequired(registration, SIGNUP_FIELDS.ZIPCODE) && (
              <ReadOnlyTextInput
                id={getFieldId(SIGNUP_FIELDS.ZIPCODE)}
                label={t(`signup.labelZipcode`)}
                value={getFieldText(signup.zipcode)}
              />
            )}
            {isSignupFieldRequired(registration, SIGNUP_FIELDS.CITY) && (
              <ReadOnlyTextInput
                id={getFieldId(SIGNUP_FIELDS.CITY)}
                label={t(`signup.labelCity`)}
                value={getFieldText(signup.city)}
              />
            )}
          </SplittedRow>
        </FormGroup>
      )}

      <TextArea
        id={getFieldId(SIGNUP_FIELDS.EXTRA_INFO)}
        className={styles.textArea}
        readOnly
        label={t(`signup.labelExtraInfo`)}
        value={getFieldText(signup.extraInfo)}
      />
    </div>
  );
};

export default Signup;
