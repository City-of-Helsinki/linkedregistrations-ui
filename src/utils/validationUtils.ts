import { TFunction } from 'next-i18next';

import { Error } from '../types';

export const createMinErrorMessage = (
  message: { min: number },
  key: string
): Record<string, unknown> => {
  return {
    ...message,
    key,
  };
};

export const isValidPhoneNumber = (phone: string): boolean =>
  /^\+?\(?\d{1,3}\)? ?-?\d{1,3} ?-?\d{3,5} ?-?\d{4}( ?-?\d{3})?/.test(phone);

export const isValidZip = (zip: string): boolean => /^\d{5}$/.test(zip);

/** Get string error text
 * @param {string} error
 * @param {boolean} touched
 * @param {Function} t
 * @return {string}
 */
export const getErrorText = (
  error: string | Error<Record<string, unknown>> | undefined,
  touched: boolean,
  t: TFunction
): string => {
  if (!!error && touched) {
    return typeof error === 'string' ? t(error) : t(error.key, error);
  }

  return '';
};
