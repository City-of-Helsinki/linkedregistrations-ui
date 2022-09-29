import { ErrorMessage, FieldProps } from 'formik';
import { CheckboxProps } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';

import useLocale from '../../../hooks/useLocale';
import Checkbox from '../checkbox/Checkbox';
import styles from './checkboxGroupField.module.scss';

type Props = FieldProps & CheckboxProps;

const CheckboxField: React.FC<Props> = ({
  field: { name, value, ...field },
  label,
  ...rest
}) => {
  const locale = useLocale();
  const { t } = useTranslation();

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
      />
      {/* Add key to for error message to be updated when UI language changes */}
      <ErrorMessage key={locale} name={name}>
        {(error) => <div className={styles.errorText}>{t(error)}</div>}
      </ErrorMessage>
    </div>
  );
};

export default CheckboxField;
