/* eslint-disable import/no-named-as-default-member */
import i18n from 'i18next';

import { fakeRegistration } from '../../../utils/mockDataUtils';
import { registrationsResponse } from '../__mocks__/registration';
import {
  getAttendeeCapacityError,
  getFreeAttendeeCapacity,
  getRegistrationWarning,
} from '../utils';

describe('getRegistrationWarning', () => {
  it('should return empty string if it is possible to enrol to the event', () => {
    expect(
      getRegistrationWarning(registrationsResponse.data[0], i18n.t.bind(i18n))
    ).toBe('');
  });

  it('should return correct warning if there is space in waiting list', () => {
    expect(
      getRegistrationWarning(registrationsResponse.data[1], i18n.t.bind(i18n))
    ).toBe(
      'Ilmoittautuminen tähän tapahtumaan on vielä mahdollista, mutta jonopaikkoja on jäljellä vain 10 kpl.'
    );
  });

  it('should return correct warning if all spaces are gone and there are no waiting list', () => {
    expect(
      getRegistrationWarning(registrationsResponse.data[2], i18n.t.bind(i18n))
    ).toBe(
      'Ilmoittautuminen tähän tapahtumaan on tällä hetkellä suljettu. Kokeile myöhemmin uudelleen.'
    );
  });
  it('should return correct warning if it is not possible to enrol to the event', () => {
    expect(
      getRegistrationWarning(registrationsResponse.data[3], i18n.t.bind(i18n))
    ).toBe(
      'Ilmoittautuminen tähän tapahtumaan on tällä hetkellä suljettu. Kokeile myöhemmin uudelleen.'
    );
  });

  it('should return empty string if maximum attendee capacity is not set', () => {
    expect(
      getRegistrationWarning(registrationsResponse.data[4], i18n.t.bind(i18n))
    ).toBe('');
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
        fakeRegistration({ maximum_attendee_capacity: 3 }),
        4,
        i18n.t.bind(i18n)
      )
    ).toBe('Osallistujien enimmäismäärä on 3.');
  });
});

describe('getFreeAttendeeCapacity', () => {
  it('should return undefined if maximum_attendee_capacity is not defined', () => {
    expect(
      getFreeAttendeeCapacity(
        fakeRegistration({ maximum_attendee_capacity: null })
      )
    ).toBeUndefined();
  });

  it('should return correct amount if maximum_attendee_capacity is defined', () => {
    expect(
      getFreeAttendeeCapacity(
        fakeRegistration({
          current_attendee_count: 4,
          maximum_attendee_capacity: 40,
        })
      )
    ).toBe(36);
  });
});
