import { AxiosError } from 'axios';
import isArray from 'lodash/isArray';
import { NextParsedUrlQuery } from 'next/dist/server/request-meta';

import { ExtendedSession } from '../../types';
import queryBuilder from '../../utils/queryBuilder';
import { callGet } from '../app/axios/axiosClient';
import { SignupsResponse } from '../signup/types';

import { SignupSearchInitialValues, SignupsQueryVariables } from './types';

export const getSignupsSearchInitialValues = (
  query: NextParsedUrlQuery
): SignupSearchInitialValues => {
  const { page, text } = query;

  return {
    page: Number.isInteger(Number(page)) ? Number(page) : 1,
    text: isArray(text) ? text[0] : text ?? '',
  };
};

export const signupsPathBuilder = (args: SignupsQueryVariables): string => {
  const { attendeeStatus, page, pageSize, registration, text } = args;
  const variableToKeyItems = [
    { key: 'attendee_status', value: attendeeStatus },
    { key: 'page', value: page },
    { key: 'page_size', value: pageSize },
    { key: 'registration', value: registration },
    { key: 'text', value: text },
  ];

  const query = queryBuilder(variableToKeyItems);
  return `/signup/${query}`;
};

export const fetchSignups = async (
  args: SignupsQueryVariables,
  session: ExtendedSession | null
): Promise<SignupsResponse> => {
  try {
    const { data } = await callGet({
      session,
      url: signupsPathBuilder(args),
    });
    return data;
  } catch (error) {
    /* istanbul ignore next */
    throw Error(JSON.stringify((error as AxiosError).response?.data));
  }
};
