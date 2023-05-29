/* eslint-disable import/no-named-as-default-member */
import i18n from 'i18next';
import { advanceTo, clear } from 'jest-date-mock';

import { fakeRegistration } from '../../../utils/mockDataUtils';
import { RegistrationQueryVariables } from '../types';
import {
  getAttendeeCapacityError,
  getFreeAttendeeOrWaitingListCapacity,
  getFreeWaitingListCapacity,
  getRegistrationWarning,
  isAttendeeCapacityUsed,
  isRegistrationOpen,
  isWaitingListCapacityUsed,
  registrationPathBuilder,
} from '../utils';

afterEach(() => {
  clear();
});

describe('getRegistrationWarning', () => {
  beforeEach(() => {
    advanceTo('2022-11-07');
  });

  const singleRegistrationOverrides = {
    enrolment_end_time: new Date('2022-11-08').toISOString(),
    enrolment_start_time: new Date('2022-11-06').toISOString(),
    maximum_attendee_capacity: 10,
    waiting_list_capacity: 10,
  };

  it('should return empty string if it is possible to enrol to the event', () => {
    expect(
      getRegistrationWarning(
        fakeRegistration({
          ...singleRegistrationOverrides,
          current_attendee_count: 0,
          remaining_attendee_capacity: 10,
        }),
        i18n.t.bind(i18n)
      )
    ).toBe('');
  });

  it('should return correct warning if there is space in waiting list', () => {
    expect(
      getRegistrationWarning(
        fakeRegistration({
          ...singleRegistrationOverrides,
          current_attendee_count: 10,
          current_waiting_list_count: 0,
          remaining_attendee_capacity: 0,
          remaining_waiting_list_capacity: 10,
        }),
        i18n.t.bind(i18n)
      )
    ).toBe(
      'Ilmoittautuminen tähän tapahtumaan on vielä mahdollista, mutta jonopaikkoja on jäljellä vain 10 kpl.'
    );
  });

  it('should return empty string if maximum attendee capacity is not set', () => {
    expect(
      getRegistrationWarning(
        fakeRegistration({
          ...singleRegistrationOverrides,
          current_attendee_count: 10,
          maximum_attendee_capacity: null,
          remaining_attendee_capacity: null,
        }),
        i18n.t.bind(i18n)
      )
    ).toBe('');
  });

  it('should return correct warning if event is full and waiting list capacity is not set', () => {
    expect(
      getRegistrationWarning(
        fakeRegistration({
          ...singleRegistrationOverrides,
          current_attendee_count: 10,
          remaining_attendee_capacity: 0,
          waiting_list_capacity: null,
        }),
        i18n.t.bind(i18n)
      )
    ).toBe(
      'Ilmoittautuminen tähän tapahtumaan on vielä mahdollista, mutta vain jonopaikkoja on jäljellä.'
    );
  });
});

describe('getAttendeeCapacityError', () => {
  it('should return undefined if maximum_attendee_capacity is not defined', () => {
    expect(
      getAttendeeCapacityError(
        fakeRegistration({ maximum_attendee_capacity: null }),
        4,
        i18n.t.bind(i18n)
      )
    ).toBeUndefined();
  });

  it('should return correct error if participantAmount is less than 1', () => {
    expect(
      getAttendeeCapacityError(
        fakeRegistration({ maximum_attendee_capacity: null }),
        0,
        i18n.t.bind(i18n)
      )
    ).toBe('Osallistujien vähimmäismäärä on 1.');
  });

  it('should return correct error if participantAmount is greater than maximum_attendee_capacity', () => {
    expect(
      getAttendeeCapacityError(
        fakeRegistration({
          maximum_attendee_capacity: 3,
          current_attendee_count: 0,
          remaining_attendee_capacity: 3,
        }),
        4,
        i18n.t.bind(i18n)
      )
    ).toBe('Osallistujien enimmäismäärä on 3.');
  });
});

describe('isAttendeeCapacityUsed', () => {
  it('should return false if maximum_attendee_capacity is not defined', () => {
    expect(
      isAttendeeCapacityUsed(
        fakeRegistration({ maximum_attendee_capacity: null })
      )
    ).toBe(false);
  });

  it('should return false if current attendee count is less than maximum attendee capacity', () => {
    expect(
      isAttendeeCapacityUsed(
        fakeRegistration({
          current_attendee_count: 4,
          maximum_attendee_capacity: 40,
        })
      )
    ).toBe(false);
  });

  it('should return true if current attendee count equals maximum attendee capacity', () => {
    expect(
      isAttendeeCapacityUsed(
        fakeRegistration({
          current_attendee_count: 40,
          maximum_attendee_capacity: 40,
        })
      )
    ).toBe(true);
  });

  it('should return true if current attendee count is greater than maximum attendee capacity', () => {
    expect(
      isAttendeeCapacityUsed(
        fakeRegistration({
          current_attendee_count: 41,
          maximum_attendee_capacity: 40,
        })
      )
    ).toBe(true);
  });
});

describe('getFreeWaitingListCapacity', () => {
  it('should return undefined if waiting_list_capacity is not defined', () => {
    expect(
      getFreeWaitingListCapacity(
        fakeRegistration({ waiting_list_capacity: null })
      )
    ).toBe(undefined);
  });

  it('should return correct amount if waiting_list_capacity is defined', () => {
    expect(
      getFreeWaitingListCapacity(
        fakeRegistration({
          current_waiting_list_count: 4,
          waiting_list_capacity: 40,
          remaining_waiting_list_capacity: 36,
        })
      )
    ).toBe(36);
  });
});

describe('isWaitingListCapacityUsed', () => {
  it('should return false if waiting_list_capacity is not defined', () => {
    expect(
      isWaitingListCapacityUsed(
        fakeRegistration({ waiting_list_capacity: null })
      )
    ).toBe(false);
  });

  it('should return true if current waiting list count is greater than waiting_list_capacity', () => {
    expect(
      isWaitingListCapacityUsed(
        fakeRegistration({
          waiting_list_capacity: 15,
          current_waiting_list_count: 16,
        })
      )
    ).toBe(true);
  });

  it('should return true if current waiting list count equals waiting_list_capacity', () => {
    expect(
      isWaitingListCapacityUsed(
        fakeRegistration({
          waiting_list_capacity: 15,
          current_waiting_list_count: 15,
        })
      )
    ).toBe(true);
  });

  it('should return true if current waiting list count is less than waiting_list_capacity', () => {
    expect(
      isWaitingListCapacityUsed(
        fakeRegistration({
          waiting_list_capacity: 15,
          current_waiting_list_count: 14,
        })
      )
    ).toBe(false);
  });
});

describe('isRegistrationOpen', () => {
  it('should return false if enrolment_start_time is not defined', () => {
    expect(
      isRegistrationOpen(fakeRegistration({ enrolment_start_time: '' }))
    ).toBe(false);
  });

  it('should return false if enrolment_start_time is not in the past', () => {
    advanceTo('2022-11-07');

    expect(
      isRegistrationOpen(
        fakeRegistration({
          enrolment_start_time: new Date('2022-11-08').toISOString(),
        })
      )
    ).toBe(false);
  });

  it('should return false if enrolment_start_time is in the past and enrolment_start_time is in the past', () => {
    advanceTo('2022-11-07');

    expect(
      isRegistrationOpen(
        fakeRegistration({
          enrolment_end_time: new Date('2022-11-06').toISOString(),
          enrolment_start_time: new Date('2022-11-06').toISOString(),
        })
      )
    ).toBe(false);
  });

  it('should return true if enrolment_start_time is in the past and enrolment_start_time is not defined', () => {
    advanceTo('2022-11-07');

    expect(
      isRegistrationOpen(
        fakeRegistration({
          enrolment_end_time: '',
          enrolment_start_time: new Date('2022-11-06').toISOString(),
        })
      )
    ).toBe(true);
  });

  it('should return true if enrolment_start_time is in the past and enrolment_start_time is in the future', () => {
    advanceTo('2022-11-07');

    expect(
      isRegistrationOpen(
        fakeRegistration({
          enrolment_end_time: new Date('2022-11-08').toISOString(),
          enrolment_start_time: new Date('2022-11-06').toISOString(),
        })
      )
    ).toBe(true);
  });
});

describe('getFreeAttendeeOrWaitingListCapacity function', () => {
  test('should return undefined if maximum attendee capacity is not set', () => {
    expect(
      getFreeAttendeeOrWaitingListCapacity(
        fakeRegistration({ maximum_attendee_capacity: null })
      )
    ).toBe(undefined);
  });

  test('should return 0 if maximum attendee capacity is not used but all seats are reserved', () => {
    expect(
      getFreeAttendeeOrWaitingListCapacity(
        fakeRegistration({
          current_attendee_count: 3,
          maximum_attendee_capacity: 10,
          remaining_attendee_capacity: 0,
        })
      )
    ).toBe(0);
  });
  test('should return free capacity', () => {
    expect(
      getFreeAttendeeOrWaitingListCapacity(
        fakeRegistration({
          current_attendee_count: 3,
          maximum_attendee_capacity: 10,
          remaining_attendee_capacity: 7,
        })
      )
    ).toBe(7);
  });
  test('should return undefined if waiting list capacity is not set', () => {
    expect(
      getFreeAttendeeOrWaitingListCapacity(
        fakeRegistration({
          current_attendee_count: 10,
          maximum_attendee_capacity: 10,
          remaining_attendee_capacity: 0,
          waiting_list_capacity: null,
        })
      )
    ).toBe(undefined);
  });

  test('should return remaining waiting list capacity', () => {
    expect(
      getFreeAttendeeOrWaitingListCapacity(
        fakeRegistration({
          current_attendee_count: 10,
          current_waiting_list_count: 3,
          maximum_attendee_capacity: 10,
          remaining_attendee_capacity: 0,
          remaining_waiting_list_capacity: 7,
          waiting_list_capacity: 10,
        })
      )
    ).toBe(7);
  });
});

describe('registrationPathBuilder function', () => {
  const cases: [RegistrationQueryVariables, string][] = [
    [{ id: 'hel:123' }, '/registration/hel:123/?nocache=true'],
    [
      { id: 'hel:123', include: ['include1'] },
      '/registration/hel:123/?include=include1&nocache=true',
    ],
  ];

  it.each(cases)('should build correct path', (variables, expectedPath) =>
    expect(registrationPathBuilder(variables)).toBe(expectedPath)
  );
});
