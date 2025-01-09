import classNames from 'classnames';
import { Select, SelectProps } from 'hds-react';
import React from 'react';

import styles from '../select/select.module.scss';
import SelectLoadingSpinner, {
  SelectLoadingSpinnerProps,
} from '../selectLoadingSpinner/SelectLoadingSpinner';

export type SingleSelectProps = SelectLoadingSpinnerProps &
  SelectProps & { className?: string };

const SingleSelect: React.FC<SingleSelectProps> = ({
  className,
  isLoading,
  ...rest
}) => {
  return (
    <SelectLoadingSpinner isLoading={isLoading}>
      <Select
        {...rest}
        className={classNames(className, styles.select)}
        children={undefined}
      />
    </SelectLoadingSpinner>
  );
};

export default SingleSelect;
