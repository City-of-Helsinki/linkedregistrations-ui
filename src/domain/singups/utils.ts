import isArray from 'lodash/isArray';
import isNumber from 'lodash/isNumber';
import { NextParsedUrlQuery } from 'next/dist/server/request-meta';

import { SignupSearchInitialValues } from './types';

export const getSignupsSearchInitialValues = (
  query: NextParsedUrlQuery
): SignupSearchInitialValues => {
  const { page, text } = query;

  return {
    page: isNumber(page) ? Number(page) : 1,
    text: isArray(text) ? text[0] : text ?? '',
  };
};
