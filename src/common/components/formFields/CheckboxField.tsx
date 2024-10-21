import { FieldProps, useField } from 'formik';
import { CheckboxProps } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';

import { getErrorText } from '../../../utils/validationUtils';
import Checkbox from '../checkbox/Checkbox';

type Props = FieldProps & CheckboxProps;

const CheckboxField: React.FC<Props> = ({
  field: { name, value, ...field },
  label,
  ...rest
}) => {
  const { t } = useTranslation('common');
  const [, { touched, error }] = useField(name);

  const errorText = getErrorText(error, touched, t);

  return (
    <div>
      <Checkbox
        {...rest}
        {...field}
        id={name}
        name={name}
        checked={value}
        value={value}
        label={label}
        errorText={errorText}
        aria-invalid={!!error}
      />
    </div>
  );
};

export default CheckboxField;
