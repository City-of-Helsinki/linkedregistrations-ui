import { SIGNUPS_SEARCH_PARAMS } from './constants';

export type SignupSearchInitialValues = {
  [SIGNUPS_SEARCH_PARAMS.PAGE]: number;
  [SIGNUPS_SEARCH_PARAMS.TEXT]: string;
};
