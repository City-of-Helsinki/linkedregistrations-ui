import classNames from 'classnames';
import { ErrorMessage, FieldProps } from 'formik';
import { CheckboxProps, IconAngleDown, IconAngleUp } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';

import useLocale from '../../../hooks/useLocale';
import { OptionType } from '../../../types';
import { getErrorText } from '../../../utils/validationUtils';
import Button from '../button/Button';
import Checkbox from '../checkbox/Checkbox';
import styles from './checkboxGroupField.module.scss';

type Columns = 1 | 2 | 3 | 4;

export type CheckboxGroupFieldProps = {
  className?: string;
  columns: Columns;
  disabledOptions: string[];
  errorName?: string;
  min: number;
  options: OptionType[];
  visibleOptionAmount?: number;
} & FieldProps &
  CheckboxProps;

const CheckboxGroupField: React.FC<CheckboxGroupFieldProps> = ({
  className,
  columns = 2,
  disabled,
  disabledOptions,
  field: { name, onBlur, value, ...field },
  errorName,
  min = 0,
  options,
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
    <>
      <div
        id={errorName || name}
        className={classNames(
          styles.checkboxsWrapper,
          styles[`columns${columns}`],
          className
        )}
      >
        {visibleOptions.map((option, index) => {
          const checked = value.includes(option.value);

          return (
            <Checkbox
              key={index}
              {...rest}
              {...field}
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
      {visibleOptionAmount && (
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
    </>
  );
};

export default CheckboxGroupField;
