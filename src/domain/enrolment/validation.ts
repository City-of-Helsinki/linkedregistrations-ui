import endOfDay from 'date-fns/endOfDay';
import isAfter from 'date-fns/isAfter';
import isBefore from 'date-fns/isBefore';
import startOfDay from 'date-fns/startOfDay';
import subYears from 'date-fns/subYears';
import { FormikErrors, FormikTouched } from 'formik';
import set from 'lodash/set';
import { scroller } from 'react-scroll';
import * as Yup from 'yup';

import { VALIDATION_MESSAGE_KEYS } from '../../constants';
import isValidDate from '../../utils/isValidDate';
import stringToDate from '../../utils/stringToDate';
import {
  createMinErrorMessage,
  isValidPhoneNumber,
  isValidZip,
} from '../../utils/validationUtils';
import wait from '../../utils/wait';
import { numberOrNull, stringOrNull } from '../api/types';
import { Registration } from '../registration/types';
import {
  ATTENDEE_FIELDS,
  ENROLMENT_FIELDS,
  ENROLMENT_FORM_SELECT_FIELDS,
  NOTIFICATIONS,
} from './constants';
import { EnrolmentFormFields } from './types';
import { isDateOfBirthFieldRequired, isEnrolmentFieldRequired } from './utils';

export const isAboveMinAge = (
  dateStr: stringOrNull | undefined,
  minAge: numberOrNull
): boolean =>
  minAge && dateStr && isValidDate(dateStr)
    ? isBefore(stringToDate(dateStr), subYears(endOfDay(new Date()), minAge))
    : true;

export const isBelowMaxAge = (
  dateStr: stringOrNull | undefined,
  maxAge: numberOrNull
): boolean =>
  maxAge && dateStr && isValidDate(dateStr)
    ? isAfter(
        stringToDate(dateStr),
        subYears(startOfDay(new Date()), maxAge + 1)
      )
    : true;

const getStringSchema = (required: boolean) =>
  required
    ? Yup.string().required(VALIDATION_MESSAGE_KEYS.STRING_REQUIRED)
    : Yup.string();

export const getAttendeeSchema = (registration: Registration) => {
  const { audience_max_age, audience_min_age } = registration;

  return Yup.object().shape({
    [ATTENDEE_FIELDS.NAME]: getStringSchema(
      isEnrolmentFieldRequired(registration, ATTENDEE_FIELDS.NAME)
    ),
    [ATTENDEE_FIELDS.STREET_ADDRESS]: getStringSchema(
      isEnrolmentFieldRequired(registration, ATTENDEE_FIELDS.STREET_ADDRESS)
    ),
    [ATTENDEE_FIELDS.DATE_OF_BIRTH]: getStringSchema(
      isDateOfBirthFieldRequired(registration)
    )
      .test(
        'isAboveMinAge',
        () => ({
          key: VALIDATION_MESSAGE_KEYS.AGE_MIN,
          min: audience_min_age,
        }),
        (date) => isAboveMinAge(date, audience_min_age)
      )
      .test(
        'isBelowMaxAge',
        () => ({
          key: VALIDATION_MESSAGE_KEYS.AGE_MAX,
          max: audience_max_age,
        }),
        (date) => isBelowMaxAge(date, audience_max_age)
      ),
    [ATTENDEE_FIELDS.ZIPCODE]: getStringSchema(
      isEnrolmentFieldRequired(registration, ATTENDEE_FIELDS.ZIPCODE)
    ).test(
      'isValidZip',
      VALIDATION_MESSAGE_KEYS.ZIP,
      (value) => !value || isValidZip(value)
    ),
    [ATTENDEE_FIELDS.CITY]: getStringSchema(
      isEnrolmentFieldRequired(registration, ATTENDEE_FIELDS.CITY)
    ),
    [ATTENDEE_FIELDS.EXTRA_INFO]: getStringSchema(
      isEnrolmentFieldRequired(registration, ATTENDEE_FIELDS.EXTRA_INFO)
    ),
  });
};

export const getEnrolmentSchema = (registration: Registration) => {
  return Yup.object().shape({
    [ENROLMENT_FIELDS.ATTENDEES]: Yup.array().of(
      getAttendeeSchema(registration)
    ),
    [ENROLMENT_FIELDS.EMAIL]: Yup.string()
      .email(VALIDATION_MESSAGE_KEYS.EMAIL)
      .required(VALIDATION_MESSAGE_KEYS.STRING_REQUIRED),
    [ENROLMENT_FIELDS.PHONE_NUMBER]: getStringSchema(
      isEnrolmentFieldRequired(registration, ENROLMENT_FIELDS.PHONE_NUMBER)
    )
      .test(
        'isValidPhoneNumber',
        VALIDATION_MESSAGE_KEYS.PHONE,
        (value) => !value || isValidPhoneNumber(value)
      )
      .when(
        [ENROLMENT_FIELDS.NOTIFICATIONS],
        (notifications: string[], schema) =>
          notifications.includes(NOTIFICATIONS.SMS)
            ? schema.required(VALIDATION_MESSAGE_KEYS.STRING_REQUIRED)
            : schema
      ),
    [ENROLMENT_FIELDS.MEMBERSHIP_NUMBER]: getStringSchema(
      isEnrolmentFieldRequired(registration, ENROLMENT_FIELDS.MEMBERSHIP_NUMBER)
    ),
    [ENROLMENT_FIELDS.NOTIFICATIONS]: Yup.array()
      .required(VALIDATION_MESSAGE_KEYS.ARRAY_REQUIRED)
      .min(1, (param) =>
        createMinErrorMessage(param, VALIDATION_MESSAGE_KEYS.ARRAY_MIN)
      ),
    [ENROLMENT_FIELDS.NATIVE_LANGUAGE]: Yup.string().required(
      VALIDATION_MESSAGE_KEYS.STRING_REQUIRED
    ),
    [ENROLMENT_FIELDS.SERVICE_LANGUAGE]: Yup.string().required(
      VALIDATION_MESSAGE_KEYS.STRING_REQUIRED
    ),
    [ENROLMENT_FIELDS.EXTRA_INFO]: getStringSchema(
      isEnrolmentFieldRequired(registration, ENROLMENT_FIELDS.EXTRA_INFO)
    ),
    [ENROLMENT_FIELDS.ACCEPTED]: Yup.bool().oneOf(
      [true],
      VALIDATION_MESSAGE_KEYS.ENROLMENT_ACCEPTED
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
  setErrors: (errors: FormikErrors<EnrolmentFormFields>) => void;
  setTouched: (
    touched: FormikTouched<EnrolmentFormFields>,
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
  if (ENROLMENT_FORM_SELECT_FIELDS.find((item) => item === fieldName)) {
    return { fieldId: `${fieldName}-toggle-button`, fieldType: 'select' };
  } else if (fieldName === ENROLMENT_FIELDS.NOTIFICATIONS) {
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

    if (/^attendees\[\d*\]\./.test(path)) {
      const attendeeIndex = Number(path.match(/(?<=\[)[[\d]{1,4}(?=\])/)?.[0]);
      setOpenAccordion(attendeeIndex);

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
