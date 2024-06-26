import { Field } from 'formik';
import { Fieldset, IconTrash } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React, { useMemo } from 'react';

import Accordion from '../../../../../common/components/accordion/Accordion';
import DateInputField from '../../../../../common/components/formFields/DateInputField';
import SingleSelectField from '../../../../../common/components/formFields/SingleSelectField';
import TextAreaField from '../../../../../common/components/formFields/TextAreaField';
import TextInputField from '../../../../../common/components/formFields/TextInputField';
import FormGroup from '../../../../../common/components/formGroup/FormGroup';
import SplittedRow from '../../../../../common/components/splittedRow/SplittedRow';
import {
  DEFAULT_SPLITTED_ROW_TYPE,
  READ_ONLY_PLACEHOLDER,
  SPLITTED_ROW_TYPE,
} from '../../../../../constants';
import useLocale from '../../../../../hooks/useLocale';
import { featureFlagUtils } from '../../../../../utils/featureFlags';
import skipFalsyType from '../../../../../utils/skipFalsyType';
import { Registration } from '../../../../registration/types';
import { SIGNUP_FIELDS } from '../../../constants';
import useSignupPriceGroupOptions from '../../../hooks/useSignupPriceGroupOptions';
import InWaitingListInfo from '../../../inWaitingListInfo/InWaitingListInfo';
import { useSignupGroupFormContext } from '../../../signupGroupFormContext/hooks/useSignupGroupFormContext';
import { SignupFormFields } from '../../../types';
import {
  isDateOfBirthFieldRequired,
  isSignupFieldRequired,
} from '../../../utils';

import styles from './signup.module.scss';

export type SignupProps = {
  formDisabled: boolean;
  index: number;
  isEditingMode: boolean;
  onDelete: () => void;
  readOnly?: boolean;
  registration: Registration;
  showDelete: boolean;
  signup: SignupFormFields;
  signupPath: string;
};

const getFieldName = (signupPath: string, field: string) =>
  `${signupPath}.${field}`;

const Signup: React.FC<SignupProps> = ({
  formDisabled,
  index,
  isEditingMode,
  onDelete,
  readOnly,
  registration,
  showDelete,
  signup,
  signupPath,
}) => {
  const { t } = useTranslation(['signup']);
  const locale = useLocale();
  const { openParticipant, toggleOpenParticipant } =
    useSignupGroupFormContext();

  const getPlaceholder = (placeholder: string) =>
    readOnly ? READ_ONLY_PLACEHOLDER : placeholder;

  /* istanbul ignore next */
  const getRowClassName = (className: string) =>
    readOnly ? styles.readOnlyRow : className;

  const priceGroupOptions = useSignupPriceGroupOptions(registration);

  const accordionLabel = useMemo(() => {
    const nameText =
      [signup.firstName, signup.lastName].filter(skipFalsyType).join(' ') ||
      t('signup.signupDefaultTitle', { index: index + 1 });
    const optionText =
      featureFlagUtils.isFeatureEnabled('WEB_STORE_INTEGRATION') &&
      priceGroupOptions?.find((o) => o.value === signup.priceGroup)?.label;

    return optionText ? [nameText, optionText].join(' — ') : nameText;
  }, [
    index,
    priceGroupOptions,
    signup.firstName,
    signup.lastName,
    signup.priceGroup,
    t,
  ]);

  const getSplittedRowType = (type: SPLITTED_ROW_TYPE): SPLITTED_ROW_TYPE =>
    readOnly ? DEFAULT_SPLITTED_ROW_TYPE : type;

  return (
    <Accordion
      deleteButton={
        showDelete && !formDisabled ? (
          <button
            aria-label={t('signup.buttonDeleteSignup')}
            className={styles.deleteButton}
            onClick={onDelete}
            type="button"
          >
            <IconTrash />
          </button>
        ) : undefined
      }
      onClick={() => toggleOpenParticipant(index)}
      open={openParticipant === index}
      toggleButtonIcon={
        signup.inWaitingList ? <InWaitingListInfo /> : undefined
      }
      toggleButtonLabel={accordionLabel}
    >
      <Fieldset heading={t(`signup.titleBasicInfo`)}>
        {Boolean(
          featureFlagUtils.isFeatureEnabled('WEB_STORE_INTEGRATION') &&
            priceGroupOptions.length
        ) && (
          <FormGroup>
            <div className={getRowClassName(styles.nameRow)}>
              <Field
                name={getFieldName(signupPath, SIGNUP_FIELDS.PRICE_GROUP)}
                component={SingleSelectField}
                disabled={formDisabled || isEditingMode}
                label={t('signup.labelPriceGroup')}
                options={priceGroupOptions}
                placeholder={t('signup.placeholderPriceGroup')}
                required={!!priceGroupOptions?.length}
              />
            </div>
          </FormGroup>
        )}

        {(isSignupFieldRequired(registration, SIGNUP_FIELDS.FIRST_NAME) ||
          isSignupFieldRequired(registration, SIGNUP_FIELDS.LAST_NAME)) && (
          <FormGroup>
            <SplittedRow>
              {isSignupFieldRequired(
                registration,
                SIGNUP_FIELDS.FIRST_NAME
              ) && (
                <Field
                  name={getFieldName(signupPath, SIGNUP_FIELDS.FIRST_NAME)}
                  component={TextInputField}
                  disabled={formDisabled}
                  label={t(`signup.labelFirstName`)}
                  placeholder={getPlaceholder(t(`signup.placeholderFirstName`))}
                  readOnly={readOnly}
                  required={true}
                />
              )}
              {isSignupFieldRequired(registration, SIGNUP_FIELDS.LAST_NAME) && (
                <Field
                  name={getFieldName(signupPath, SIGNUP_FIELDS.LAST_NAME)}
                  component={TextInputField}
                  disabled={formDisabled}
                  label={t(`signup.labelLastName`)}
                  placeholder={getPlaceholder(t(`signup.placeholderLastName`))}
                  readOnly={readOnly}
                  required={true}
                />
              )}
            </SplittedRow>
          </FormGroup>
        )}

        {isSignupFieldRequired(registration, SIGNUP_FIELDS.PHONE_NUMBER) && (
          <FormGroup>
            <SplittedRow>
              <Field
                name={getFieldName(signupPath, SIGNUP_FIELDS.PHONE_NUMBER)}
                component={TextInputField}
                disabled={formDisabled}
                label={t(`signup.labelPhoneNumber`)}
                placeholder={getPlaceholder(t(`signup.placeholderPhoneNumber`))}
                readOnly={readOnly}
                required={true}
              />
            </SplittedRow>
          </FormGroup>
        )}

        {(isSignupFieldRequired(registration, SIGNUP_FIELDS.STREET_ADDRESS) ||
          isDateOfBirthFieldRequired(registration)) && (
          <FormGroup>
            <SplittedRow
              className={styles.streetAddressRow}
              type={getSplittedRowType(
                /* istanbul ignore next */
                isSignupFieldRequired(
                  registration,
                  SIGNUP_FIELDS.STREET_ADDRESS
                )
                  ? SPLITTED_ROW_TYPE.LARGE_SMALL
                  : SPLITTED_ROW_TYPE.SMALL_LARGE
              )}
            >
              {isSignupFieldRequired(
                registration,
                SIGNUP_FIELDS.STREET_ADDRESS
              ) && (
                <Field
                  name={getFieldName(signupPath, SIGNUP_FIELDS.STREET_ADDRESS)}
                  component={TextInputField}
                  disabled={formDisabled}
                  label={t(`signup.labelStreetAddress`)}
                  placeholder={getPlaceholder(
                    t(`signup.placeholderStreetAddress`)
                  )}
                  readOnly={readOnly}
                  required={true}
                />
              )}
              {isDateOfBirthFieldRequired(registration) && (
                <Field
                  name={getFieldName(signupPath, SIGNUP_FIELDS.DATE_OF_BIRTH)}
                  component={DateInputField}
                  disabled={formDisabled || readOnly}
                  label={t(`signup.labelDateOfBirth`)}
                  language={locale}
                  maxDate={new Date()}
                  minDate={new Date(`${new Date().getFullYear() - 100}-01-01`)}
                  placeholder={getPlaceholder(
                    t(`signup.placeholderDateOfBirth`)
                  )}
                  readOnly={readOnly}
                  required={true}
                />
              )}
            </SplittedRow>
          </FormGroup>
        )}

        {(isSignupFieldRequired(registration, SIGNUP_FIELDS.ZIPCODE) ||
          isSignupFieldRequired(registration, SIGNUP_FIELDS.CITY)) && (
          <FormGroup>
            <SplittedRow
              type={getSplittedRowType(
                isSignupFieldRequired(registration, SIGNUP_FIELDS.ZIPCODE)
                  ? SPLITTED_ROW_TYPE.SMALL_LARGE
                  : SPLITTED_ROW_TYPE.LARGE_SMALL
              )}
            >
              {isSignupFieldRequired(registration, SIGNUP_FIELDS.ZIPCODE) && (
                <Field
                  name={getFieldName(signupPath, SIGNUP_FIELDS.ZIPCODE)}
                  component={TextInputField}
                  disabled={formDisabled}
                  label={t(`signup.labelZipcode`)}
                  placeholder={getPlaceholder(t(`signup.placeholderZipcode`))}
                  readOnly={readOnly}
                  required={true}
                />
              )}
              {isSignupFieldRequired(registration, SIGNUP_FIELDS.CITY) && (
                <Field
                  name={getFieldName(signupPath, SIGNUP_FIELDS.CITY)}
                  component={TextInputField}
                  disabled={formDisabled}
                  label={t(`signup.labelCity`)}
                  placeholder={getPlaceholder(t(`signup.placeholderCity`))}
                  readOnly={readOnly}
                  required={true}
                />
              )}
            </SplittedRow>
          </FormGroup>
        )}

        <Field
          name={getFieldName(signupPath, SIGNUP_FIELDS.EXTRA_INFO)}
          className={styles.extraInfoField}
          component={TextAreaField}
          disabled={formDisabled}
          helperText={t(`signup.helperExtraInfo`)}
          label={t(`signup.labelExtraInfo`)}
          placeholder={getPlaceholder(t(`signup.placeholderExtraInfo`))}
          readOnly={readOnly}
          required={isSignupFieldRequired(
            registration,
            SIGNUP_FIELDS.EXTRA_INFO
          )}
        />
      </Fieldset>
    </Accordion>
  );
};

export default Signup;
