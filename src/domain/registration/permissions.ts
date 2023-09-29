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
    user?.is_strongly_identified && registration?.has_registration_user_access
  );
};
