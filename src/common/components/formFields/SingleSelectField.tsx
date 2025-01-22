import { FieldProps, useField } from 'formik';
import { Option, SelectProps } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';

import { getErrorText } from '../../../utils/validationUtils';
import SingleSelect from '../singleSelect/SingleSelect';

type Props = SelectProps & FieldProps;

const SingleSelectField: React.FC<Props> = ({
  field: { name, onBlur, onChange, value, ...field },
  texts,
  options,
  ...rest
}) => {
  const { t } = useTranslation();
  const [, { touched, error }] = useField(name);

  const errorText = getErrorText(error, touched, t);

  const handleBlur = () => {
    onBlur({ target: { id: name, value } });
  };

  const handleChange = (selectedOptions: Option[], clickedOption: Option) => {
    const hasSelections = selectedOptions.length > 0;

    // Set timeout to prevent Android devices to end up
    // to an infinite loop when changing value
    setTimeout(() => {
      onChange({
        target: { id: name, value: clickedOption?.value },
      });
    }, 5);

    return {
      invalid: !hasSelections,
      texts: {
        error: hasSelections ? '' : errorText,
      },
    };
  };

  const selected = options?.find(
    (option): option is Option =>
      typeof option !== 'string' && option.value === value
  );

  return (
    <SingleSelect
      {...rest}
      {...field}
      id={name}
      onBlur={handleBlur}
      onChange={handleChange}
      options={options}
      value={selected?.value}
      invalid={!!errorText}
      texts={{ ...texts, error: errorText }}
    />
  );
};

export default SingleSelectField;
