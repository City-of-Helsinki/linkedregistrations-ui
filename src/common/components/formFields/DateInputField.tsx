import { FieldProps, useField } from 'formik';
import { DateInputProps } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';

import { getErrorText } from '../../../utils/validationUtils';
import DateInput from '../dateInput/DateInput';

type Props = FieldProps & DateInputProps;

const DateInputField: React.FC<Props> = ({
  field: { name, value, onBlur, onChange, ...field },
  helperText,
  ...rest
}) => {
  const { t } = useTranslation();
  const [, { touched, error }] = useField(name);

  const errorText = getErrorText(error, touched, t);

  const handleBlur = () => {
    onBlur({
      target: {
        id: name,
      },
    });
  };

  const handleChange = (value: string) => {
    onChange({
      target: {
        id: name,
        value,
      },
    });
  };

  return (
    <DateInput
      {...rest}
      {...field}
      id={name}
      name={name}
      errorText={errorText}
      helperText={helperText}
      invalid={Boolean(errorText)}
      onBlur={handleBlur}
      onChange={handleChange}
      value={value}
    />
  );
};

export default DateInputField;
