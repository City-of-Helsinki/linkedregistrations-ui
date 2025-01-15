/* eslint-disable @typescript-eslint/no-explicit-any */

import i18n from 'i18next';
import { advanceTo, clear } from 'jest-date-mock';
import { rest } from 'msw';

import {
  fakeRegistration,
  getMockedSeatsReservationData,
  setSessionStorageValues,
} from '../../../utils/mockDataUtils';
import { fakeAuthenticatedSession } from '../../../utils/mockSession';
import { setQueryMocks, waitFor } from '../../../utils/testUtils';
import { TEST_REGISTRATION_ID } from '../constants';
import { Registration, RegistrationQueryVariables } from '../types';
import {
  exportSignupsAsExcel,
  getAttendeeCapacityError,
  getFreeAttendeeOrWaitingListCapacity,
  getFreeWaitingListCapacity,
  getMaxSeatsAmount,
  getRegistrationWarning,
  isAttendeeCapacityUsed,
  isRegistrationOpen,
  isRegistrationPossible,
  isSignupEnded,
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

  const singleRegistrationOverrides: Partial<Registration> = {
    enrolment_start_time: new Date('2022-11-06').toISOString(),
    enrolment_end_time: new Date('2022-11-08').toISOString(),
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

  it('should return correct warning if enrolment is not open', () => {
    expect(
      getRegistrationWarning(
        fakeRegistration({
          ...singleRegistrationOverrides,
          enrolment_start_time: new Date('2022-11-04').toISOString(),
          enrolment_end_time: new Date('2022-11-06').toISOString(),
        }),
        i18n.t.bind(i18n)
      )
    ).toBe('Ilmoittautuminen tähän tapahtumaan avautuu 4.11.2022 klo 00.00.');

    expect(
      getRegistrationWarning(
        fakeRegistration({
          ...singleRegistrationOverrides,
          enrolment_start_time: '',
          enrolment_end_time: new Date('2022-11-06').toISOString(),
        }),
        i18n.t.bind(i18n)
      )
    ).toBe(
      'Ilmoittautuminen tähän tapahtumaan on tällä hetkellä suljettu. Kokeile myöhemmin uudelleen.'
    );
  });

  it('should return correct warning if there is no available seats', () => {
    expect(
      getRegistrationWarning(
        fakeRegistration({
          ...singleRegistrationOverrides,
          current_attendee_count: 10,
          current_waiting_list_count: 0,
          remaining_attendee_capacity: 0,
          remaining_waiting_list_capacity: 0,
        }),
        i18n.t.bind(i18n)
      )
    ).toBe(
      'Tapahtuman kaikki paikat ovat tällä hetkellä varatut. Kokeile myöhemmin uudelleen.'
    );
  });

  it('should return correct warning if there are free seats in waiting list', () => {
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
  beforeEach(() => {
    advanceTo('2022-11-07');
  });

  it('should return true if enrolment_start_time is not defined', () => {
    expect(
      isRegistrationOpen(
        fakeRegistration({ enrolment_start_time: '', enrolment_end_time: '' })
      )
    ).toBe(true);
  });

  it('should return false if enrolment_start_time is in the future', () => {
    expect(
      isRegistrationOpen(
        fakeRegistration({
          enrolment_start_time: new Date('2022-11-08').toISOString(),
          enrolment_end_time: '',
        })
      )
    ).toBe(false);
  });

  it('should return true if enrolment_start_time is in the past and enrolment_start_time is in the future', () => {
    expect(
      isRegistrationOpen(
        fakeRegistration({
          enrolment_start_time: new Date('2022-11-06').toISOString(),
          enrolment_end_time: new Date('2022-11-08').toISOString(),
        })
      )
    ).toBe(true);
  });

  it('should return false if enrolment_end_time is in the past', () => {
    expect(
      isRegistrationOpen(
        fakeRegistration({
          enrolment_start_time: '',
          enrolment_end_time: new Date('2022-11-06').toISOString(),
        })
      )
    ).toBe(false);
  });
});

describe('isSignupEnded', () => {
  beforeEach(() => {
    advanceTo('2022-11-07');
  });

  it('should return false if enrolment_start_time is not defined', () => {
    expect(isSignupEnded(fakeRegistration({ enrolment_end_time: '' }))).toBe(
      false
    );
  });

  it('should return false if enrolment_start_time is in the future', () => {
    expect(
      isSignupEnded(
        fakeRegistration({
          enrolment_end_time: new Date('2022-11-08').toISOString(),
        })
      )
    ).toBe(false);
  });

  it('should return true if enrolment_end_time is in the past', () => {
    expect(
      isSignupEnded(
        fakeRegistration({
          enrolment_end_time: new Date('2022-11-06').toISOString(),
        })
      )
    ).toBe(true);
  });
});

describe('isRegistrationPossible', () => {
  it('should return false if registration is not open', () => {
    advanceTo('2022-11-07');

    expect(
      isRegistrationPossible(
        fakeRegistration({
          enrolment_start_time: new Date('2022-11-08').toISOString(),
          enrolment_end_time: '',
        })
      )
    ).toBe(false);
  });

  it('should return false if all seats are reserved', () => {
    expect(
      isRegistrationPossible(
        fakeRegistration({
          enrolment_start_time: '',
          enrolment_end_time: '',
          current_attendee_count: 10,
          current_waiting_list_count: 10,
          maximum_attendee_capacity: 10,
          waiting_list_capacity: 10,
          remaining_attendee_capacity: 0,
          remaining_waiting_list_capacity: 0,
        })
      )
    ).toBe(false);
  });

  it('should return true if all seats in event are not reserved', () => {
    expect(
      isRegistrationPossible(
        fakeRegistration({
          enrolment_start_time: '',
          enrolment_end_time: '',
          current_attendee_count: 5,
          maximum_attendee_capacity: 10,
          remaining_attendee_capacity: 5,
        })
      )
    ).toBe(true);
  });

  it('should return false if all seats in event are reserved', () => {
    expect(
      isRegistrationPossible(
        fakeRegistration({
          enrolment_start_time: '',
          enrolment_end_time: '',
          current_attendee_count: 5,
          maximum_attendee_capacity: 10,
          remaining_attendee_capacity: 0,
        })
      )
    ).toBe(false);
  });

  it('should return true if all seats in waiting list are not reserved', () => {
    expect(
      isRegistrationPossible(
        fakeRegistration({
          enrolment_start_time: '',
          enrolment_end_time: '',
          current_attendee_count: 10,
          current_waiting_list_count: 5,
          maximum_attendee_capacity: 10,
          waiting_list_capacity: 10,
          remaining_attendee_capacity: 0,
          remaining_waiting_list_capacity: 5,
        })
      )
    ).toBe(true);
  });

  it('should return false if all seats in waiting list are reserved', () => {
    expect(
      isRegistrationPossible(
        fakeRegistration({
          enrolment_start_time: '',
          enrolment_end_time: '',
          current_attendee_count: 10,
          current_waiting_list_count: 5,
          maximum_attendee_capacity: 10,
          waiting_list_capacity: 10,
          remaining_attendee_capacity: 0,
          remaining_waiting_list_capacity: 0,
        })
      )
    ).toBe(false);
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

describe('getMaxSeatsAmount function', () => {
  test('should return undefined if maximum attendee capacity maximum group size is not set', () => {
    expect(
      getMaxSeatsAmount(
        fakeRegistration({
          maximum_attendee_capacity: null,
          maximum_group_size: null,
        })
      )
    ).toBe(undefined);
  });

  test('should return maximum group size if maximum attendee capacity is not defined', () => {
    expect(
      getMaxSeatsAmount(
        fakeRegistration({
          maximum_attendee_capacity: null,
          maximum_group_size: 4,
        })
      )
    ).toBe(4);
  });

  test('should return free capacity if maximum group size is not defined', () => {
    expect(
      getMaxSeatsAmount(
        fakeRegistration({
          current_attendee_count: 3,
          maximum_attendee_capacity: 10,
          maximum_group_size: null,
          remaining_attendee_capacity: 7,
        })
      )
    ).toBe(7);
  });

  test('should return free capacity if maximum group size is greated than free capacity', () => {
    expect(
      getMaxSeatsAmount(
        fakeRegistration({
          current_attendee_count: 3,
          maximum_attendee_capacity: 10,
          maximum_group_size: 8,
          remaining_attendee_capacity: 7,
        })
      )
    ).toBe(7);
  });

  test('should return maximum group size if maximum group size is less that free capacity', () => {
    expect(
      getMaxSeatsAmount(
        fakeRegistration({
          current_attendee_count: 3,
          maximum_attendee_capacity: 10,
          maximum_group_size: 6,
          remaining_attendee_capacity: 7,
        })
      )
    ).toBe(6);
  });

  test('should return correct free capacity if seats reservation is stored to session storage', () => {
    const reservation = getMockedSeatsReservationData(1000);
    reservation.seats = 5;
    const registration = fakeRegistration({
      current_attendee_count: 2,
      id: TEST_REGISTRATION_ID,
      maximum_attendee_capacity: 15,
      maximum_group_size: null,
      remaining_attendee_capacity: 7,
    });
    setSessionStorageValues(reservation, registration);

    expect(getMaxSeatsAmount(registration)).toBe(12);
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

describe('exportSignupsAsExcel function', () => {
  const registration = fakeRegistration({ id: TEST_REGISTRATION_ID });

  it('should download signups as excel', async () => {
    const link: any = { click: jest.fn(), remove: jest.fn() };
    global.URL.createObjectURL = jest.fn(() => 'https://test.com');
    global.URL.revokeObjectURL = jest.fn();
    const createElement = document.createElement;
    document.createElement = jest.fn().mockImplementation(() => link);

    setQueryMocks(
      rest.get(
        `*registration/${TEST_REGISTRATION_ID}/signups/export/xlsx/`,
        (req, res, ctx) => res(ctx.status(200), ctx.json(registration))
      )
    );
    exportSignupsAsExcel({
      addNotification: jest.fn(),
      registration,
      session: fakeAuthenticatedSession(),
      t: i18n.t.bind(i18n),
      uiLanguage: 'fi',
    });

    await waitFor(() =>
      expect(link.download).toBe(`registered_persons_${registration.id}`)
    );
    expect(link.href).toBe('https://test.com');
    expect(link.click).toHaveBeenCalledTimes(1);
    // Restore original createElement to avoid unexpected side effects
    document.createElement = createElement;
  });

  const errorsCases: [number, string][] = [
    [401, 'Kirjaudu sisään suorittaaksesi tämän toiminnon.'],
    [403, 'Sinulla ei ole lupaa suorittaa tätä toimintoa.'],
    [500, 'Virhe palvelimella.'],
  ];

  it.each(errorsCases)(
    'should show correct correct error, %p returns %p',
    async (status, error) => {
      setQueryMocks(
        rest.get(
          `*registration/${TEST_REGISTRATION_ID}/signups/export/xlsx/`,
          (req, res, ctx) => res(ctx.status(status), ctx.json({}))
        )
      );

      const addNotification = jest.fn();
      exportSignupsAsExcel({
        addNotification,
        registration,
        session: fakeAuthenticatedSession(),
        t: i18n.t.bind(i18n),
        uiLanguage: 'fi',
      });

      await waitFor(() =>
        expect(addNotification).toBeCalledWith({ label: error, type: 'error' })
      );
    }
  );
});
