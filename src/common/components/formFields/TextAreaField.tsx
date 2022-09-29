import { FieldProps, useField } from 'formik';
import { TextAreaProps } from 'hds-react';
import isNil from 'lodash/isNil';
import { useTranslation } from 'next-i18next';
import React from 'react';

import { getErrorText } from '../../../utils/validationUtils';
import TextArea from '../textArea/TextArea';

export type TextAreaFieldProps = FieldProps & TextAreaProps;

const TextAreaField: React.FC<TextAreaFieldProps> = ({
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
    <TextArea
      {...rest}
      {...field}
      id={name}
      name={name}
      value={value}
      errorText={errorText}
      helperText={helperText || charsLeftText}
      invalid={!!errorText}
      maxLength={maxLength}
    />
  );
};

export default TextAreaField;
