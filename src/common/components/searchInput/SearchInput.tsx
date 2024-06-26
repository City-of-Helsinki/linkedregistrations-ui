import classNames from 'classnames';
import { IconSearch, TextInputProps } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React, { useId } from 'react';

import TextInput from '../textInput/TextInput';

import styles from './searchInput.module.scss';

export type SearchInputProps = {
  clearButtonAriaLabel?: string;
  hideLabel?: boolean;
  onChange: (text: string) => void;
  onSubmit: (text: string) => void;
  searchButtonAriaLabel?: string;
  value: string;
} & Omit<TextInputProps, 'id' | 'onChange' | 'onSubmit'>;

const SearchInput: React.FC<SearchInputProps> = ({
  className,
  clearButtonAriaLabel,
  hideLabel,
  onChange,
  onSubmit,
  searchButtonAriaLabel,
  value,
  ...rest
}) => {
  const { t } = useTranslation('common');
  const id = useId();

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    onChange(event.target.value);
  };
  const doSearch = () => {
    onSubmit(value);
  };

  const onInputKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      doSearch();
    }
  };

  return (
    <TextInput
      {...rest}
      buttonAriaLabel={searchButtonAriaLabel ?? t('common:search')}
      buttonIcon={<IconSearch aria-hidden />}
      className={classNames(className, {
        [styles.hideLabel]: hideLabel,
      })}
      clearButton={true}
      clearButtonAriaLabel={clearButtonAriaLabel ?? t('common:clear')}
      id={id}
      onButtonClick={doSearch}
      onChange={handleChange}
      onKeyUp={onInputKeyUp}
      value={value}
    />
  );
};

export default SearchInput;
