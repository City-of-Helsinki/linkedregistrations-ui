import endOfDay from 'date-fns/endOfDay';
import isAfter from 'date-fns/isAfter';
import isBefore from 'date-fns/isBefore';
import max from 'date-fns/max';
import startOfDay from 'date-fns/startOfDay';
import subYears from 'date-fns/subYears';
import { FormikErrors, FormikTouched } from 'formik';
import set from 'lodash/set';
import { scroller } from 'react-scroll';
import * as Yup from 'yup';

import { VALIDATION_MESSAGE_KEYS } from '../../constants';
import { featureFlagUtils } from '../../utils/featureFlags';
import isValidDate from '../../utils/isValidDate';
import stringToDate from '../../utils/stringToDate';
import {
  createMinErrorMessage,
  createStringMaxErrorMessage,
  isValidPhoneNumber,
  isValidZip,
} from '../../utils/validationUtils';
import wait from '../../utils/wait';
import { numberOrNull, stringOrNull } from '../api/types';
import { Registration } from '../registration/types';

import {
  CONTACT_PERSON_FIELDS,
  CONTACT_PERSON_TEXT_FIELD_MAX_LENGTH,
  NOTIFICATIONS,
  SIGNUP_FIELDS,
  SIGNUP_GROUP_FIELDS,
  SIGNUP_GROUP_FORM_SELECT_FIELDS,
  SIGNUP_TEXT_FIELD_MAX_LENGTH,
} from './constants';
import { SignupFormFields, SignupGroupFormFields } from './types';
import {
  calculateTotalPrice,
  getSignupPriceGroupOptions,
  isDateOfBirthFieldRequired,
  isSignupFieldRequired,
} from './utils';

export const isAboveMinAge = (
  dateStr: stringOrNull | undefined,
  startTime: stringOrNull,
  minAge: numberOrNull
): boolean => {
  const now = new Date();
  const dateToCompare = startTime ? max([new Date(startTime), now]) : now;

  return minAge && dateStr && isValidDate(dateStr)
    ? isBefore(stringToDate(dateStr), subYears(endOfDay(dateToCompare), minAge))
    : true;
};

export const isBelowMaxAge = (
  dateStr: stringOrNull | undefined,
  startTime: stringOrNull,
  maxAge: numberOrNull
): boolean => {
  const now = new Date();
  const dateToCompare = startTime ? max([new Date(startTime), now]) : now;

  return maxAge && dateStr && isValidDate(dateStr)
    ? isAfter(
        stringToDate(dateStr),
        subYears(startOfDay(dateToCompare), maxAge + 1)
      )
    : true;
};

const getStringSchema = (
  required: boolean,
  schema?: Yup.StringSchema<string | undefined>
): Yup.StringSchema<string | undefined> =>
  required
    ? (schema ?? Yup.string()).required(VALIDATION_MESSAGE_KEYS.STRING_REQUIRED)
    : Yup.string();

export const getSignupSchema = (registration: Registration) => {
  const {
    audience_max_age,
    audience_min_age,
    event: { start_time },
  } = registration;

  return Yup.object().shape({
    [SIGNUP_FIELDS.PRICE_GROUP]: getStringSchema(
      featureFlagUtils.isFeatureEnabled('WEB_STORE_INTEGRATION') &&
        !!registration.registration_price_groups?.length
    ),
    [SIGNUP_FIELDS.FIRST_NAME]: getStringSchema(
      isSignupFieldRequired(registration, SIGNUP_FIELDS.FIRST_NAME),
      Yup.string().max(
        SIGNUP_TEXT_FIELD_MAX_LENGTH[SIGNUP_FIELDS.FIRST_NAME],
        createStringMaxErrorMessage
      )
    ),
    [SIGNUP_FIELDS.LAST_NAME]: getStringSchema(
      isSignupFieldRequired(registration, SIGNUP_FIELDS.LAST_NAME),
      Yup.string().max(
        SIGNUP_TEXT_FIELD_MAX_LENGTH[SIGNUP_FIELDS.LAST_NAME],
        createStringMaxErrorMessage
      )
    ),
    [SIGNUP_FIELDS.PHONE_NUMBER]: getStringSchema(
      isSignupFieldRequired(registration, SIGNUP_FIELDS.PHONE_NUMBER),
      Yup.string()
        .test(
          'isValidPhoneNumber',
          VALIDATION_MESSAGE_KEYS.PHONE,
          (value) => !value || isValidPhoneNumber(value)
        )
        .max(
          SIGNUP_TEXT_FIELD_MAX_LENGTH[SIGNUP_FIELDS.PHONE_NUMBER],
          createStringMaxErrorMessage
        )
    ),
    [SIGNUP_FIELDS.STREET_ADDRESS]: getStringSchema(
      isSignupFieldRequired(registration, SIGNUP_FIELDS.STREET_ADDRESS),
      Yup.string().max(
        SIGNUP_TEXT_FIELD_MAX_LENGTH[SIGNUP_FIELDS.STREET_ADDRESS],
        createStringMaxErrorMessage
      )
    ),
    [SIGNUP_FIELDS.DATE_OF_BIRTH]: getStringSchema(
      isDateOfBirthFieldRequired(registration),
      Yup.string()
        .test(
          'isValidDate',
          VALIDATION_MESSAGE_KEYS.DATE,
          (date) => !date || isValidDate(date)
        )
        .test(
          'isAboveMinAge',
          () => ({
            key: VALIDATION_MESSAGE_KEYS.AGE_MIN,
            min: audience_min_age,
          }),
          (date) => isAboveMinAge(date, start_time, audience_min_age)
        )
        .test(
          'isBelowMaxAge',
          () => ({
            key: VALIDATION_MESSAGE_KEYS.AGE_MAX,
            max: audience_max_age,
          }),
          (date) => isBelowMaxAge(date, start_time, audience_max_age)
        )
    ),
    [SIGNUP_FIELDS.ZIPCODE]: getStringSchema(
      isSignupFieldRequired(registration, SIGNUP_FIELDS.ZIPCODE),
      Yup.string()
        .test(
          'isValidZip',
          VALIDATION_MESSAGE_KEYS.ZIP,
          (value) => !value || isValidZip(value)
        )
        .max(
          SIGNUP_TEXT_FIELD_MAX_LENGTH[SIGNUP_FIELDS.ZIPCODE],
          createStringMaxErrorMessage
        )
    ),
    [SIGNUP_FIELDS.CITY]: getStringSchema(
      isSignupFieldRequired(registration, SIGNUP_FIELDS.CITY),
      Yup.string().max(
        SIGNUP_TEXT_FIELD_MAX_LENGTH[SIGNUP_FIELDS.CITY],
        createStringMaxErrorMessage
      )
    ),
    [SIGNUP_FIELDS.EXTRA_INFO]: getStringSchema(
      isSignupFieldRequired(registration, SIGNUP_FIELDS.EXTRA_INFO)
    ),
  });
};

export const getContactPersonSchema = (
  registration: Registration,
  signups: SignupFormFields[]
) => {
  const priceGroupOptions = getSignupPriceGroupOptions(registration, 'fi');
  const paymentRequired = calculateTotalPrice(priceGroupOptions, signups) > 0;

  return Yup.object().shape({
    [CONTACT_PERSON_FIELDS.EMAIL]: getStringSchema(true)
      .email(VALIDATION_MESSAGE_KEYS.EMAIL)
      .max(
        CONTACT_PERSON_TEXT_FIELD_MAX_LENGTH[CONTACT_PERSON_FIELDS.EMAIL],
        createStringMaxErrorMessage
      ),
    [CONTACT_PERSON_FIELDS.PHONE_NUMBER]: getStringSchema(false)
      .test(
        'isValidPhoneNumber',
        VALIDATION_MESSAGE_KEYS.PHONE,
        (value) => !value || isValidPhoneNumber(value)
      )
      .when(
        [CONTACT_PERSON_FIELDS.NOTIFICATIONS],
        ([notifications]: string[][], schema) =>
          notifications.includes(NOTIFICATIONS.SMS)
            ? schema.required(VALIDATION_MESSAGE_KEYS.STRING_REQUIRED)
            : schema
      )
      .max(
        CONTACT_PERSON_TEXT_FIELD_MAX_LENGTH[
          CONTACT_PERSON_FIELDS.PHONE_NUMBER
        ],
        createStringMaxErrorMessage
      ),
    [CONTACT_PERSON_FIELDS.FIRST_NAME]: getStringSchema(paymentRequired).max(
      CONTACT_PERSON_TEXT_FIELD_MAX_LENGTH[CONTACT_PERSON_FIELDS.FIRST_NAME],
      createStringMaxErrorMessage
    ),
    [CONTACT_PERSON_FIELDS.LAST_NAME]: getStringSchema(paymentRequired).max(
      CONTACT_PERSON_TEXT_FIELD_MAX_LENGTH[CONTACT_PERSON_FIELDS.LAST_NAME],
      createStringMaxErrorMessage
    ),
    [CONTACT_PERSON_FIELDS.NOTIFICATIONS]: Yup.array()
      .required(VALIDATION_MESSAGE_KEYS.ARRAY_REQUIRED)
      .min(1, (param) =>
        createMinErrorMessage(param, VALIDATION_MESSAGE_KEYS.ARRAY_MIN)
      ),
    [CONTACT_PERSON_FIELDS.MEMBERSHIP_NUMBER]: getStringSchema(false).max(
      CONTACT_PERSON_TEXT_FIELD_MAX_LENGTH[
        CONTACT_PERSON_FIELDS.MEMBERSHIP_NUMBER
      ],
      createStringMaxErrorMessage
    ),
    [CONTACT_PERSON_FIELDS.NATIVE_LANGUAGE]: getStringSchema(false).nullable(),
    [CONTACT_PERSON_FIELDS.SERVICE_LANGUAGE]: getStringSchema(true),
    [SIGNUP_GROUP_FIELDS.EXTRA_INFO]: getStringSchema(false),
  });
};

export const getSignupGroupSchema = (
  registration: Registration,
  validateContactPerson = true
) => {
  return Yup.object().shape({
    [SIGNUP_GROUP_FIELDS.SIGNUPS]: Yup.array().of(
      getSignupSchema(registration)
    ),
    ...(validateContactPerson && {
      [SIGNUP_GROUP_FIELDS.CONTACT_PERSON]: Yup.object().when(
        [SIGNUP_GROUP_FIELDS.SIGNUPS],
        ([signups]: SignupFormFields[][]) =>
          getContactPersonSchema(registration, signups)
      ),
    }),
    [SIGNUP_GROUP_FIELDS.EXTRA_INFO]: getStringSchema(
      isSignupFieldRequired(registration, SIGNUP_GROUP_FIELDS.EXTRA_INFO)
    ),
    [SIGNUP_GROUP_FIELDS.USER_CONSENT]: Yup.bool().oneOf(
      [true],
      VALIDATION_MESSAGE_KEYS.SIGNUP_USER_CONSENT
    ),
  });
};

// This functions sets formik errors and touched values correctly after validation.
// The reason for this is to show all errors after validating the form.
// Errors are shown only for touched fields so set all fields with error touched
export const showErrors = ({
  error,
  setErrors,
  setTouched,
}: {
  error: Yup.ValidationError;
  setErrors: (errors: FormikErrors<SignupGroupFormFields>) => void;
  setTouched: (
    touched: FormikTouched<SignupGroupFormFields>,
    shouldValidate?: boolean
  ) => void;
}): void => {
  /* istanbul ignore else */
  if (error.name === 'ValidationError') {
    const newErrors = error.inner.reduce(
      (acc, e: Yup.ValidationError) =>
        set(acc, e.path ?? /* istanbul ignore next */ '', e.errors[0]),
      {}
    );
    const touchedFields = error.inner.reduce(
      (acc, e: Yup.ValidationError) =>
        set(acc, e.path ?? /* istanbul ignore next */ '', true),
      {}
    );

    setErrors(newErrors);
    setTouched(touchedFields);
  }
};

const getFocusableFieldId = (
  fieldName: string
): {
  fieldId: string;
  fieldType: 'default' | 'checkboxGroup' | 'select';
} => {
  // For the select elements, focus the toggle button
  if (
    SIGNUP_GROUP_FORM_SELECT_FIELDS.find((item) =>
      new RegExp(item).test(fieldName)
    )
  ) {
    return { fieldId: `${fieldName}-toggle-button`, fieldType: 'select' };
  } else if (
    fieldName ===
    `${SIGNUP_GROUP_FIELDS.CONTACT_PERSON}.${CONTACT_PERSON_FIELDS.NOTIFICATIONS}`
  ) {
    return { fieldId: fieldName, fieldType: 'checkboxGroup' };
  }
  return { fieldId: fieldName, fieldType: 'default' };
};

export const scrollToFirstError = async ({
  error,
  setOpenAccordion,
}: {
  error: Yup.ValidationError;
  setOpenAccordion: (index: number) => void;
}): Promise<void> => {
  for (const e of error.inner) {
    const path = e.path ?? /* istanbul ignore next */ '';

    if (/^signups\[\d*\]\./.test(path)) {
      const signupIndex = Number(path.match(/(?<=\[)[[\d]{1,4}(?=\])/)?.[0]);
      setOpenAccordion(signupIndex);

      await wait(100);
    }

    const { fieldId, fieldType } = getFocusableFieldId(path);
    const field = document.getElementById(fieldId);

    /* istanbul ignore else */
    if (field) {
      scroller.scrollTo(fieldId, {
        delay: 0,
        duration: 500,
        offset: -200,
        smooth: true,
      });

      if (fieldType === 'checkboxGroup') {
        const focusable = field.querySelectorAll('input');

        /* istanbul ignore else */
        if (focusable?.[0]) {
          focusable[0].focus();
        }
      } else {
        field.focus();
      }

      break;
    }
  }
};
