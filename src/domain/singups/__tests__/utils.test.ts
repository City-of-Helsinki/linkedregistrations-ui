import { TEST_REGISTRATION_ID } from '../../registration/constants';
import { ATTENDEE_STATUS } from '../../signup/constants';
import { SignupsQueryVariables } from '../types';
import { signupsPathBuilder } from '../utils';

describe('signupsPathBuilder function', () => {
  const cases: [SignupsQueryVariables, string][] = [
    [
      { attendeeStatus: ATTENDEE_STATUS.Attending },
      `/signup/?attendee_status=attending`,
    ],
    [{ page: 2 }, `/signup/?page=2`],
    [{ pageSize: 2 }, `/signup/?page_size=2`],
    [
      { registration: [TEST_REGISTRATION_ID] },
      `/signup/?registration=${TEST_REGISTRATION_ID}`,
    ],
    [
      { registration: [TEST_REGISTRATION_ID] },
      `/signup/?registration=${TEST_REGISTRATION_ID}`,
    ],
    [{ text: 'text' }, `/signup/?text=text`],
  ];

  it.each(cases)(
    'should create signups request path with args %p, result %p',
    (variables, expectedPath) =>
      expect(signupsPathBuilder(variables)).toBe(expectedPath)
  );
});
