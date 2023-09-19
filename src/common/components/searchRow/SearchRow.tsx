import classNames from 'classnames';
import { FC } from 'react';

import SearchInput from '../searchInput/SearchInput';

import styles from './searchRow.module.scss';

type AdminSearchRowProps = {
  className?: string;
  countText: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (value: string) => void;
  searchInputLabel: string;
  searchValue: string;
};

const SearchRow: FC<AdminSearchRowProps> = ({
  className,
  countText,
  onSearchChange,
  onSearchSubmit,
  searchInputLabel,
  searchValue,
}) => {
  return (
    <div className={classNames(styles.searchRow, className)}>
      <span className={styles.count}>{countText}</span>
      <SearchInput
        className={styles.searchInput}
        label={searchInputLabel}
        hideLabel
        onSubmit={onSearchSubmit}
        onChange={onSearchChange}
        placeholder={searchInputLabel}
        value={searchValue}
      />
    </div>
  );
};

export default SearchRow;
