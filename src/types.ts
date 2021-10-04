export type Language = 'en' | 'fi' | 'sv';

export type Error<T> = {
  key: string;
} & T;

export type OptionType = {
  label: string;
  value: string;
};