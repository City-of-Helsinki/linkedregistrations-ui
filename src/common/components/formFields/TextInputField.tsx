import { FieldProps, useField } from 'formik';
import { TextInputProps } from 'hds-react';
import isNil from 'lodash/isNil';
import { useTranslation } from 'next-i18next';
import React from 'react';

import { getErrorText } from '../../../utils/validationUtils';
import TextInput from '../textInput/TextInput';

export type TextInputFieldProps = FieldProps & TextInputProps;

const TextInputField: React.FC<TextInputFieldProps> = ({
  field: { name, value, ...field },
  helperText,
  maxLength,
  ...rest
}) => {
  const { t } = useTranslation('common');
  const [, { touched, error }] = useField(name);

  const errorText = getErrorText(error, touched, t);

  const charsLeft = !isNil(maxLength) ? maxLength - value.length : undefined;
  const charsLeftText = !isNil(charsLeft)
    ? t('validation.string.charsLeft', { count: charsLeft })
    : undefined;

  return (
    <TextInput
      {...rest}
      {...field}
      id={name}
      name={name}
      value={value}
      errorText={errorText}
      helperText={helperText || charsLeftText}
      invalid={Boolean(errorText)}
      maxLength={maxLength}
    />
  );
};

export default TextInputField;
