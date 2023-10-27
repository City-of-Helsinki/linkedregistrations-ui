import classNames from 'classnames';
import omit from 'lodash/omit';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React from 'react';

import { SearchRow } from '../../../common/components/searchRow/SearchRow';
import useSearchState from '../../../hooks/useSearchState';
import { getSignupsSearchInitialValues } from '../utils';

import styles from './searchPanel.module.scss';

type SearchState = {
  text: string;
};

const SearchPanel: React.FC = () => {
  const { t } = useTranslation('signups');
  const router = useRouter();

  const [searchState, setSearchState] = useSearchState<SearchState>({
    text: '',
  });

  const handleChangeText = (text: string) => {
    setSearchState({ text });
  };

  const handleSearch = () => {
    router.push({
      pathname: router.pathname,
      query: omit({ ...router.query, ...searchState }, 'page'),
    });
  };

  React.useEffect(() => {
    const { text } = getSignupsSearchInitialValues(router.query);
    setSearchState({ text });
  }, [router.query, setSearchState]);

  return (
    <div className={classNames('styles.searchPanel')}>
      <SearchRow
        onSearch={handleSearch}
        onSearchValueChange={handleChangeText}
        searchButtonAriaLabel={t('signups:searchPanel.buttonSearch')}
        searchButtonText={t('signups:searchPanel.buttonSearch')}
        searchInputClassName={styles.searchInput}
        searchInputLabel={t('signups:searchPanel.labelSearch')}
        searchInputPlaceholder={t('signups:searchPanel.placeholderSearch')}
        searchInputValue={searchState.text}
      />
    </div>
  );
};

export default SearchPanel;
