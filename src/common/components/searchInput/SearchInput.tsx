import classNames from 'classnames';
import {
  SearchInput as HdsSearchInput,
  SearchInputProps as HdsSearchInputProps,
} from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';

import styles from './searchInput.module.scss';

export type SearchInputProps = {
  hideLabel?: boolean;
} & HdsSearchInputProps<unknown>;

const SearchInput: React.FC<SearchInputProps> = ({
  className,
  clearButtonAriaLabel,
  hideLabel,
  searchButtonAriaLabel,
  ...rest
}) => {
  const { t } = useTranslation('common');

  return (
    <HdsSearchInput
      {...rest}
      className={classNames(className, {
        [styles.hideLabel]: hideLabel,
      })}
      clearButtonAriaLabel={clearButtonAriaLabel ?? t('common:clear')}
      searchButtonAriaLabel={searchButtonAriaLabel ?? t('common:search')}
    />
  );
};

export default SearchInput;
