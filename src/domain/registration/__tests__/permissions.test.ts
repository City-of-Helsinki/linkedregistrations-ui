/* eslint-disable max-len */
import { fakeRegistration, fakeUser } from '../../../utils/mockDataUtils';
import { REGISTRATION_ACTIONS } from '../constants';
import { checkCanUserDoRegistrationAction } from '../permissions';

describe('checkCanUserDoRegistrationAction function', () => {
  const testAdminOrgCases: [REGISTRATION_ACTIONS, boolean, boolean, boolean][] =
    [
      [REGISTRATION_ACTIONS.VIEW_ATTENDANCE_LIST, false, false, false],
      [REGISTRATION_ACTIONS.VIEW_ATTENDANCE_LIST, false, true, false],
      [REGISTRATION_ACTIONS.VIEW_ATTENDANCE_LIST, true, false, false],
      [REGISTRATION_ACTIONS.VIEW_ATTENDANCE_LIST, true, true, true],
      [REGISTRATION_ACTIONS.VIEW_SIGNUPS, false, false, false],
      [REGISTRATION_ACTIONS.VIEW_SIGNUPS, false, true, false],
      [REGISTRATION_ACTIONS.VIEW_SIGNUPS, true, false, false],
      [REGISTRATION_ACTIONS.VIEW_SIGNUPS, true, true, true],
    ];
  it.each(testAdminOrgCases)(
    'should allow/deny actions, action: %p, is_strongly_identified: %p, has_registration_user_access: %p, returns %p',
    (
      action,
      is_strongly_identified,
      has_registration_user_access,
      isAllowed
    ) => {
      const user = fakeUser({ is_strongly_identified });
      const registration = fakeRegistration({ has_registration_user_access });

      expect(
        checkCanUserDoRegistrationAction({
          action,
          registration,
          user,
        })
      ).toBe(isAllowed);
    }
  );
});
