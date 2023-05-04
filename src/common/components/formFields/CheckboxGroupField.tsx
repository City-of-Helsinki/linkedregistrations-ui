import classNames from 'classnames';
import { ErrorMessage, FieldProps } from 'formik';
import { IconAngleDown, IconAngleUp } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';

import useLocale from '../../../hooks/useLocale';
import { OptionType } from '../../../types';
import { getErrorText } from '../../../utils/validationUtils';
import Button from '../button/Button';
import Checkbox from '../checkbox/Checkbox';
import { RequiredIndicator } from '../requiredIndicator/RequiredIndicator';
import styles from './checkboxGroupField.module.scss';

type Columns = 1 | 2 | 3 | 4;

export type CheckboxGroupFieldProps = React.PropsWithChildren<
  {
    className?: string;
    columns: Columns;
    disabledOptions: string[];
    errorName?: string;
    label?: string;
    min: number;
    options: OptionType[];
    required?: boolean;
    visibleOptionAmount?: number;
  } & FieldProps &
    React.HTMLProps<HTMLFieldSetElement>
>;

const CheckboxGroupField: React.FC<CheckboxGroupFieldProps> = ({
  className,
  columns = 2,
  disabled,
  disabledOptions,
  field: { name, onBlur, value, ...field },
  errorName,
  label,
  min = 0,
  options,
  required,
  visibleOptionAmount,
  ...rest
}) => {
  const { t } = useTranslation('common');
  const locale = useLocale();
  const [showAll, setShowAll] = React.useState(false);

  const visibleOptions = [...options].slice(
    0,
    showAll ? undefined : visibleOptionAmount
  );

  const toggleShowAll = () => {
    setShowAll(!showAll);
  };

  const handleBlur = () => {
    onBlur({ target: { id: name, value } });
  };

  return (
    <fieldset className={classNames(styles.checkboxGroup, className)} {...rest}>
      <legend className={styles.label}>
        {label} {required && <RequiredIndicator />}
      </legend>
      <div
        id={errorName || name}
        className={classNames(
          styles.checkboxsWrapper,
          styles[`columns${columns}`]
        )}
      >
        {visibleOptions.map((option) => {
          const checked = value.includes(option.value);

          return (
            <Checkbox
              {...field}
              key={option.value}
              id={`${name}-${option.value}`}
              name={name}
              checked={value.includes(option.value)}
              disabled={
                disabled ||
                (checked && value.length <= min) ||
                disabledOptions?.includes(option.value)
              }
              onBlur={handleBlur}
              value={option.value}
              label={option.label}
            />
          );
        })}
      </div>
      <ErrorMessage key={locale} name={errorName || name}>
        {(error) => (
          <div className={styles.errorText}>{getErrorText(error, true, t)}</div>
        )}
      </ErrorMessage>
      {visibleOptionAmount && options.length > visibleOptionAmount && (
        <div className={styles.buttonWrapper}>
          <Button
            iconLeft={showAll ? <IconAngleUp /> : <IconAngleDown />}
            onClick={toggleShowAll}
            variant="supplementary"
          >
            {showAll ? t('showLess') : t('showMore')}
          </Button>
        </div>
      )}
    </fieldset>
  );
};

export default CheckboxGroupField;
