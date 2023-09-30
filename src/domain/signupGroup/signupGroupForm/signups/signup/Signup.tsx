import classNames from 'classnames';
import { Field } from 'formik';
import { Fieldset, IconTrash } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';

import Accordion from '../../../../../common/components/accordion/Accordion';
import DateInputField from '../../../../../common/components/formFields/DateInputField';
import TextAreaField from '../../../../../common/components/formFields/TextAreaField';
import TextInputField from '../../../../../common/components/formFields/TextInputField';
import FormGroup from '../../../../../common/components/formGroup/FormGroup';
import useLocale from '../../../../../hooks/useLocale';
import skipFalsyType from '../../../../../utils/skipFalsyType';
import { Registration } from '../../../../registration/types';
import { SIGNUP_FIELDS } from '../../../constants';
import InWaitingListInfo from '../../../inWaitingListInfo/InWaitingListInfo';
import { useSignupGroupFormContext } from '../../../signupGroupFormContext/hooks/useSignupGroupFormContext';
import { SignupFields } from '../../../types';
import {
  isDateOfBirthFieldRequired,
  isSignupFieldRequired,
} from '../../../utils';

import styles from './signup.module.scss';

type Props = {
  formDisabled: boolean;
  index: number;
  onDelete: () => void;
  registration: Registration;
  showDelete: boolean;
  signup: SignupFields;
  signupPath: string;
};

const getFieldName = (signupPath: string, field: string) =>
  `${signupPath}.${field}`;

const Signup: React.FC<Props> = ({
  formDisabled,
  index,
  onDelete,
  registration,
  showDelete,
  signup,
  signupPath,
}) => {
  const { t } = useTranslation(['signup']);
  const locale = useLocale();
  const { openParticipant, toggleOpenParticipant } =
    useSignupGroupFormContext();

  return (
    <Accordion
      deleteButton={
        showDelete && !formDisabled ? (
          <button
            aria-label={t('buttonDeleteSignup') as string}
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
        t('signupDefaultTitle', { index: index + 1 })
      }
    >
      <Fieldset heading={t(`titleBasicInfo`)}>
        <FormGroup>
          <div className={styles.nameRow}>
            <Field
              name={getFieldName(signupPath, SIGNUP_FIELDS.FIRST_NAME)}
              component={TextInputField}
              disabled={formDisabled}
              label={t(`labelFirstName`)}
              placeholder={t(`placeholderFirstName`)}
              required={isSignupFieldRequired(
                registration,
                SIGNUP_FIELDS.FIRST_NAME
              )}
            />
            <Field
              name={getFieldName(signupPath, SIGNUP_FIELDS.LAST_NAME)}
              component={TextInputField}
              disabled={formDisabled}
              label={t(`labelLastName`)}
              placeholder={t(`placeholderLastName`)}
              required={isSignupFieldRequired(
                registration,
                SIGNUP_FIELDS.LAST_NAME
              )}
            />
          </div>
        </FormGroup>
        <FormGroup>
          <div className={classNames(styles.streetAddressRow)}>
            <Field
              name={getFieldName(signupPath, SIGNUP_FIELDS.STREET_ADDRESS)}
              component={TextInputField}
              disabled={formDisabled}
              label={t(`labelStreetAddress`)}
              placeholder={t(`placeholderStreetAddress`)}
              required={isSignupFieldRequired(
                registration,
                SIGNUP_FIELDS.STREET_ADDRESS
              )}
            />
            <Field
              name={getFieldName(signupPath, SIGNUP_FIELDS.DATE_OF_BIRTH)}
              component={DateInputField}
              disabled={formDisabled}
              label={t(`labelDateOfBirth`)}
              language={locale}
              maxDate={new Date()}
              minDate={new Date(`${new Date().getFullYear() - 100}-01-01`)}
              placeholder={t(`placeholderDateOfBirth`)}
              required={isDateOfBirthFieldRequired(registration)}
            />
          </div>
        </FormGroup>
        <FormGroup>
          <div className={classNames(styles.zipRow)}>
            <Field
              name={getFieldName(signupPath, SIGNUP_FIELDS.ZIPCODE)}
              component={TextInputField}
              disabled={formDisabled}
              label={t(`labelZipcode`)}
              placeholder={t(`placeholderZipcode`)}
              required={isSignupFieldRequired(
                registration,
                SIGNUP_FIELDS.ZIPCODE
              )}
            />
            <Field
              name={getFieldName(signupPath, SIGNUP_FIELDS.CITY)}
              component={TextInputField}
              disabled={formDisabled}
              label={t(`labelCity`)}
              placeholder={t(`placeholderCity`)}
              required={isSignupFieldRequired(registration, SIGNUP_FIELDS.CITY)}
            />
          </div>
        </FormGroup>
        <Field
          name={getFieldName(signupPath, SIGNUP_FIELDS.EXTRA_INFO)}
          className={styles.extraInfoField}
          component={TextAreaField}
          disabled={formDisabled}
          label={t(`labelSignupExtraInfo`)}
          placeholder={t(`placeholderSignupExtraInfo`)}
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
