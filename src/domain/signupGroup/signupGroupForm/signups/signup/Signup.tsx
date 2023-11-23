import { Field } from 'formik';
import { Fieldset, IconTrash } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';

import Accordion from '../../../../../common/components/accordion/Accordion';
import DateInputField from '../../../../../common/components/formFields/DateInputField';
import TextAreaField from '../../../../../common/components/formFields/TextAreaField';
import TextInputField from '../../../../../common/components/formFields/TextInputField';
import FormGroup from '../../../../../common/components/formGroup/FormGroup';
import { READ_ONLY_PLACEHOLDER } from '../../../../../constants';
import useLocale from '../../../../../hooks/useLocale';
import skipFalsyType from '../../../../../utils/skipFalsyType';
import { Registration } from '../../../../registration/types';
import { SIGNUP_FIELDS } from '../../../constants';
import InWaitingListInfo from '../../../inWaitingListInfo/InWaitingListInfo';
import { useSignupGroupFormContext } from '../../../signupGroupFormContext/hooks/useSignupGroupFormContext';
import { SignupFormFields } from '../../../types';
import {
  isDateOfBirthFieldRequired,
  isSignupFieldRequired,
} from '../../../utils';

import styles from './signup.module.scss';

type Props = {
  formDisabled: boolean;
  index: number;
  onDelete: () => void;
  readOnly?: boolean;
  registration: Registration;
  showDelete: boolean;
  signup: SignupFormFields;
  signupPath: string;
};

const getFieldName = (signupPath: string, field: string) =>
  `${signupPath}.${field}`;

const Signup: React.FC<Props> = ({
  formDisabled,
  index,
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

  const getRowClassName = (className: string) =>
    readOnly ? styles.readOnlyRow : className;
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
      toggleButtonLabel={
        [signup.firstName, signup.lastName].filter(skipFalsyType).join(' ') ||
        t('signup.signupDefaultTitle', { index: index + 1 })
      }
    >
      <Fieldset heading={t(`signup.titleBasicInfo`)}>
        <FormGroup>
          <div className={getRowClassName(styles.nameRow)}>
            <Field
              name={getFieldName(signupPath, SIGNUP_FIELDS.FIRST_NAME)}
              component={TextInputField}
              disabled={formDisabled}
              label={t(`signup.labelFirstName`)}
              placeholder={getPlaceholder(t(`signup.placeholderFirstName`))}
              readOnly={readOnly}
              required={isSignupFieldRequired(
                registration,
                SIGNUP_FIELDS.FIRST_NAME
              )}
            />
            <Field
              name={getFieldName(signupPath, SIGNUP_FIELDS.LAST_NAME)}
              component={TextInputField}
              disabled={formDisabled}
              label={t(`signup.labelLastName`)}
              placeholder={getPlaceholder(t(`signup.placeholderLastName`))}
              readOnly={readOnly}
              required={isSignupFieldRequired(
                registration,
                SIGNUP_FIELDS.LAST_NAME
              )}
            />
          </div>
        </FormGroup>
        <FormGroup>
          <div className={getRowClassName(styles.streetAddressRow)}>
            <Field
              name={getFieldName(signupPath, SIGNUP_FIELDS.STREET_ADDRESS)}
              component={TextInputField}
              disabled={formDisabled}
              label={t(`signup.labelStreetAddress`)}
              placeholder={getPlaceholder(t(`signup.placeholderStreetAddress`))}
              readOnly={readOnly}
              required={isSignupFieldRequired(
                registration,
                SIGNUP_FIELDS.STREET_ADDRESS
              )}
            />
            <Field
              name={getFieldName(signupPath, SIGNUP_FIELDS.DATE_OF_BIRTH)}
              component={DateInputField}
              disabled={formDisabled || readOnly}
              label={t(`signup.labelDateOfBirth`)}
              language={locale}
              maxDate={new Date()}
              minDate={new Date(`${new Date().getFullYear() - 100}-01-01`)}
              placeholder={getPlaceholder(t(`signup.placeholderDateOfBirth`))}
              readOnly={readOnly}
              required={isDateOfBirthFieldRequired(registration)}
            />
          </div>
        </FormGroup>
        <FormGroup>
          <div className={getRowClassName(styles.zipRow)}>
            <Field
              name={getFieldName(signupPath, SIGNUP_FIELDS.ZIPCODE)}
              component={TextInputField}
              disabled={formDisabled}
              label={t(`signup.labelZipcode`)}
              placeholder={getPlaceholder(t(`signup.placeholderZipcode`))}
              readOnly={readOnly}
              required={isSignupFieldRequired(
                registration,
                SIGNUP_FIELDS.ZIPCODE
              )}
            />
            <Field
              name={getFieldName(signupPath, SIGNUP_FIELDS.CITY)}
              component={TextInputField}
              disabled={formDisabled}
              label={t(`signup.labelCity`)}
              placeholder={getPlaceholder(t(`signup.placeholderCity`))}
              readOnly={readOnly}
              required={isSignupFieldRequired(registration, SIGNUP_FIELDS.CITY)}
            />
          </div>
        </FormGroup>
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
