import classNames from 'classnames';
import { FC } from 'react';

import SearchInput from '../../../common/components/searchInput/SearchInput';

import styles from './searchRow.module.scss';

type SearchRowProps = {
  className?: string;
  countText: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (value: string) => void;
  searchInputLabel: string;
  searchValue: string;
};
/**
 * Component to set define layout for search input and search result count text
 */
const SearchRow: FC<SearchRowProps> = ({
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
