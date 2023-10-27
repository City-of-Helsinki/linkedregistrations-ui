import { SIGNUPS_SEARCH_PARAMS } from './constants';

export type SignupSearchInitialValues = {
  [SIGNUPS_SEARCH_PARAMS.PAGE]: number;
  [SIGNUPS_SEARCH_PARAMS.TEXT]: string;
};

export type SignupsQueryVariables = {
  attendeeStatus?: string;
  page?: number;
  pageSize?: number;
  registration?: string[];
  text?: string;
};
