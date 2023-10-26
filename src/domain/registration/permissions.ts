import { User } from '../user/types';

import { REGISTRATION_ACTIONS } from './constants';
import { Registration } from './types';

export const hasRegistrationUserAccess = ({
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

export const checkCanUserDoRegistrationAction = ({
  action,
  registration,
  user,
}: {
  action: REGISTRATION_ACTIONS;
  registration?: Registration;
  user?: User;
}): boolean => {
  const isRegistrationUser = hasRegistrationUserAccess({
    registration,
    user,
  });

  switch (action) {
    case REGISTRATION_ACTIONS.VIEW_ATTENDANCE_LIST:
    case REGISTRATION_ACTIONS.VIEW_SIGNUPS:
      return isRegistrationUser;
  }
};
