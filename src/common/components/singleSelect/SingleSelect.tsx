import classNames from 'classnames';
import { Select, SingleSelectProps as HdsSingleSelectProps } from 'hds-react';
import React from 'react';

import { OptionType } from '../../../types';
import ComboboxLoadingSpinner, {
  ComboboxLoadingSpinnerProps,
} from '../comboboxLoadingSpinner/ComboboxLoadingSpinner';
import styles from '../select/select.module.scss';

export type SingleSelectProps = ComboboxLoadingSpinnerProps &
  HdsSingleSelectProps<OptionType>;

const SingleSelect: React.FC<SingleSelectProps> = ({
  className,
  isLoading,
  ...rest
}) => {
  return (
    <ComboboxLoadingSpinner isLoading={isLoading}>
      <Select {...rest} className={classNames(className, styles.select)} />
    </ComboboxLoadingSpinner>
  );
};

export default SingleSelect;
