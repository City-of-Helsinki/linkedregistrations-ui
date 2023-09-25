import { User } from '../user/types';

import { Registration } from './types';

export const canUserUpdateSignupPresenceStatus = ({
  registration,
  user,
}: {
  registration?: Registration;
  user?: User;
}): boolean => {
  return Boolean(
    user?.is_strongly_identified &&
      registration?.registration_user_accesses?.find(
        (i) => i.email === user.email
      )
  );
};
