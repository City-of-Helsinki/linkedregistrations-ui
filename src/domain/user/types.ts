import { stringOrNull } from '../api/types';

export type User = {
  admin_organizations: string[];
  date_joined: stringOrNull;
  department_name: stringOrNull;
  display_name: string;
  email: string;
  first_name: string;
  is_external: boolean;
  is_staff: boolean;
  is_strongly_identified: boolean;
  last_login: stringOrNull;
  last_name: string;
  organization: stringOrNull;
  organization_memberships: string[];
  username: string;
  uuid: string;
  '@id': string;
  '@context': string;
  '@type': string;
};

export type UserQueryVariables = {
  username: string;
};
