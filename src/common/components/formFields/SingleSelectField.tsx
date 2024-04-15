import { FieldProps, useField } from 'formik';
import { SingleSelectProps } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';

import { OptionType } from '../../../types';
import { getErrorText } from '../../../utils/validationUtils';
import SingleSelect from '../singleSelect/SingleSelect';

type Props = SingleSelectProps<OptionType> & FieldProps;

const SingleSelectField: React.FC<Props> = ({
  field: { name, onBlur, onChange, value, ...field },
  helper,
  options,
  ...rest
}) => {
  const { t } = useTranslation();
  const [, { touched, error }] = useField(name);

  const errorText = getErrorText(error, touched, t);

  const handleBlur = () => {
    onBlur({ target: { id: name, value } });
  };

  const handleChange = (selected: OptionType) => {
    // Set timeout to prevent Android devices to end up
    // to an infinite loop when changing value
    setTimeout(() => {
      onChange({
        target: { id: name, value: selected?.value },
      });
    }, 5);
  };

  return (
    <SingleSelect
      {...rest}
      {...field}
      id={name}
      onBlur={handleBlur}
      onChange={handleChange}
      options={options}
      value={
        options.find((option) => option.value === value) ??
        (null as unknown as undefined)
      }
      helper={helper}
      error={errorText}
      invalid={!!errorText}
    />
  );
};

export default SingleSelectField;
