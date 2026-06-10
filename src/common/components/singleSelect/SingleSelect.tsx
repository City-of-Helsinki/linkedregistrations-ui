import classNames from 'classnames';
import { Select } from 'hds-react';
import React, { ComponentProps } from 'react';

import styles from '../select/select.module.scss';
import SelectLoadingSpinner, {
  SelectLoadingSpinnerProps,
} from '../selectLoadingSpinner/SelectLoadingSpinner';

export type SingleSelectProps = SelectLoadingSpinnerProps &
  ComponentProps<typeof Select> & { className?: string };

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
