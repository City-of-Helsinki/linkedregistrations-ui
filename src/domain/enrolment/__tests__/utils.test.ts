import { fakeEnrolment, fakeRegistration } from '../../../utils/mockDataUtils';
import { registration } from '../../registration/__mocks__/registration';
import { REGISTRATION_MANDATORY_FIELDS } from '../../registration/constants';
import {
  ATTENDEE_INITIAL_VALUES,
  ENROLMENT_FIELDS,
  ENROLMENT_INITIAL_VALUES,
  NOTIFICATIONS,
  NOTIFICATION_TYPE,
} from '../constants';
import { EnrolmentQueryVariables } from '../types';
import {
  enrolmentPathBuilder,
  getAttendeeDefaultInitialValues,
  getEnrolmentDefaultInitialValues,
  getEnrolmentInitialValues,
  getEnrolmentNotificationsCode,
  getEnrolmentNotificationTypes,
  getEnrolmentPayload,
  isEnrolmentFieldRequired,
} from '../utils';

describe('enrolmentPathBuilder function', () => {
  const cases: [EnrolmentQueryVariables, string][] = [
    [
      {
        cancellationCode: 'hel:123',
        enrolmentId: 'enrolment:1',
      },
      '/signup/enrolment:1/?cancellation_code=hel:123',
    ],
  ];

  it.each(cases)('should build correct path', (variables, expectedPath) =>
    expect(enrolmentPathBuilder(variables)).toBe(expectedPath)
  );
});

describe('getEnrolmentNotificationsCode function', () => {
  it('should return correct notification core', () => {
    expect(getEnrolmentNotificationsCode([])).toBe(
      NOTIFICATION_TYPE.NO_NOTIFICATION
    );
    expect(getEnrolmentNotificationsCode([NOTIFICATIONS.SMS])).toBe(
      NOTIFICATION_TYPE.SMS
    );
    expect(getEnrolmentNotificationsCode([NOTIFICATIONS.EMAIL])).toBe(
      NOTIFICATION_TYPE.EMAIL
    );
    expect(
      getEnrolmentNotificationsCode([NOTIFICATIONS.EMAIL, NOTIFICATIONS.SMS])
    ).toBe(NOTIFICATION_TYPE.SMS_EMAIL);
  });
});

describe('getEnrolmentPayload function', () => {
  const reservationCode = 'code';
  it('should return single enrolment as payload', () => {
    expect(
      getEnrolmentPayload({
        formValues: {
          ...ENROLMENT_INITIAL_VALUES,
          attendees: [ATTENDEE_INITIAL_VALUES],
        },
        registration,
        reservationCode,
      })
    ).toEqual({
      registration: registration.id,
      reservation_code: 'code',
      signups: [
        {
          city: '',
          date_of_birth: null,
          email: null,
          extra_info: '',
          membership_number: '',
          name: '',
          native_language: null,
          notifications: 'none',
          phone_number: null,
          service_language: null,
          street_address: null,
          zipcode: null,
        },
      ],
    });

    const city = 'City',
      dateOfBirth = '10.10.1999',
      email = 'Email',
      extraInfo = 'Extra info',
      membershipNumber = 'XXX-123',
      name = 'Name',
      nativeLanguage = 'fi',
      notifications = [NOTIFICATIONS.EMAIL],
      phoneNumber = '0441234567',
      serviceLanguage = 'sv',
      streetAddress = 'Street address',
      zipcode = '00100';
    const payload = getEnrolmentPayload({
      formValues: {
        ...ENROLMENT_INITIAL_VALUES,
        attendees: [
          {
            city,
            dateOfBirth,
            extraInfo: '',
            inWaitingList: false,
            name,
            streetAddress,
            zipcode,
          },
        ],
        email,
        extraInfo,
        membershipNumber,
        nativeLanguage,
        notifications,
        phoneNumber,
        serviceLanguage,
      },
      registration,
      reservationCode,
    });

    expect(payload).toEqual({
      registration: registration.id,
      reservation_code: reservationCode,
      signups: [
        {
          city,
          date_of_birth: '1999-10-10',
          email,
          extra_info: extraInfo,
          membership_number: membershipNumber,
          name,
          native_language: nativeLanguage,
          notifications: NOTIFICATION_TYPE.EMAIL,
          phone_number: phoneNumber,
          service_language: serviceLanguage,
          street_address: streetAddress,
          zipcode,
        },
      ],
    });
  });
});

describe('getAttendeeDefaultInitialValues function', () => {
  it('should return attendee initial values', () => {
    expect(getAttendeeDefaultInitialValues()).toEqual({
      city: '',
      dateOfBirth: '',
      extraInfo: '',
      inWaitingList: false,
      name: '',
      streetAddress: '',
      zipcode: '',
    });
  });
});

describe('getEnrolmentDefaultInitialValues function', () => {
  it('should return enrolment initial values', () => {
    expect(getEnrolmentDefaultInitialValues()).toEqual({
      accepted: false,
      attendees: [
        {
          city: '',
          dateOfBirth: '',
          extraInfo: '',
          inWaitingList: false,
          name: '',
          streetAddress: '',
          zipcode: '',
        },
      ],
      email: '',
      extraInfo: '',
      membershipNumber: '',
      nativeLanguage: '',
      notifications: [],
      phoneNumber: '',
      serviceLanguage: '',
    });
  });
});

describe('getEnrolmentInitialValues function', () => {
  it('should return default values if value is not set', () => {
    const {
      attendees,
      email,
      extraInfo,
      membershipNumber,
      nativeLanguage,
      notifications,
      phoneNumber,
      serviceLanguage,
    } = getEnrolmentInitialValues(
      fakeEnrolment({
        city: null,
        date_of_birth: null,
        email: null,
        extra_info: null,
        membership_number: null,
        name: null,
        native_language: null,
        notifications: NOTIFICATION_TYPE.NO_NOTIFICATION,
        phone_number: null,
        service_language: null,
        street_address: null,
        zipcode: null,
      })
    );

    expect(attendees).toEqual([
      {
        city: '-',
        dateOfBirth: '',
        extraInfo: '',
        inWaitingList: false,
        name: '-',
        streetAddress: '-',
        zipcode: '-',
      },
    ]);
    expect(email).toBe('-');
    expect(extraInfo).toBe('-');
    expect(membershipNumber).toBe('-');
    expect(nativeLanguage).toBe('');
    expect(notifications).toEqual([]);
    expect(phoneNumber).toBe('-');
    expect(serviceLanguage).toBe('');
  });

  it('should return enrolment initial values', () => {
    const expectedCity = 'City';
    const expectedDateOfBirth = '10.10.2021';
    const expectedEmail = 'user@email.com';
    const expectedExtraInfo = 'Extra info';
    const expectedMembershipNumber = 'XXX-XXX-XXX';
    const expectedName = 'Name';
    const expectedNativeLanguage = 'fi';
    const expectedNotifications = [NOTIFICATIONS.EMAIL, NOTIFICATIONS.SMS];
    const expectedPhoneNumber = '+358 44 123 4567';
    const expectedServiceLanguage = 'sv';
    const expectedStreetAddress = 'Test address';
    const expectedZip = '12345';

    const {
      attendees,
      email,
      extraInfo,
      membershipNumber,
      nativeLanguage,
      notifications,
      phoneNumber,
      serviceLanguage,
    } = getEnrolmentInitialValues(
      fakeEnrolment({
        city: expectedCity,
        date_of_birth: '2021-10-10',
        email: expectedEmail,
        extra_info: expectedExtraInfo,
        membership_number: expectedMembershipNumber,
        name: expectedName,
        native_language: expectedNativeLanguage,
        notifications: NOTIFICATION_TYPE.SMS_EMAIL,
        phone_number: expectedPhoneNumber,
        service_language: expectedServiceLanguage,
        street_address: expectedStreetAddress,
        zipcode: expectedZip,
      })
    );

    expect(attendees).toEqual([
      {
        city: expectedCity,
        dateOfBirth: expectedDateOfBirth,
        extraInfo: '',
        inWaitingList: false,
        name: expectedName,
        streetAddress: expectedStreetAddress,
        zipcode: expectedZip,
      },
    ]);
    expect(email).toBe(expectedEmail);
    expect(extraInfo).toBe(expectedExtraInfo);
    expect(membershipNumber).toBe(expectedMembershipNumber);
    expect(nativeLanguage).toBe(expectedNativeLanguage);
    expect(notifications).toEqual(expectedNotifications);
    expect(phoneNumber).toBe(expectedPhoneNumber);
    expect(serviceLanguage).toBe(expectedServiceLanguage);
  });
});

describe('getEnrolmentNotificationTypes function', () => {
  it('should return correct notification types', () => {
    expect(
      getEnrolmentNotificationTypes(NOTIFICATION_TYPE.NO_NOTIFICATION)
    ).toEqual([]);
    expect(getEnrolmentNotificationTypes(NOTIFICATION_TYPE.SMS)).toEqual([
      NOTIFICATIONS.SMS,
    ]);
    expect(getEnrolmentNotificationTypes(NOTIFICATION_TYPE.EMAIL)).toEqual([
      NOTIFICATIONS.EMAIL,
    ]);
    expect(getEnrolmentNotificationTypes(NOTIFICATION_TYPE.SMS_EMAIL)).toEqual([
      NOTIFICATIONS.EMAIL,
      NOTIFICATIONS.SMS,
    ]);
    expect(getEnrolmentNotificationTypes('lorem ipsum')).toEqual([]);
  });
});

describe('isEnrolmentFieldRequired', () => {
  const falseCases: [string[], ENROLMENT_FIELDS][] = [
    [[REGISTRATION_MANDATORY_FIELDS.PHONE_NUMBER], ENROLMENT_FIELDS.EMAIL],
    [[REGISTRATION_MANDATORY_FIELDS.PHONE_NUMBER], ENROLMENT_FIELDS.EXTRA_INFO],
    [
      [REGISTRATION_MANDATORY_FIELDS.PHONE_NUMBER],
      ENROLMENT_FIELDS.MEMBERSHIP_NUMBER,
    ],
    [
      [REGISTRATION_MANDATORY_FIELDS.PHONE_NUMBER],
      ENROLMENT_FIELDS.NATIVE_LANGUAGE,
    ],
    [
      [REGISTRATION_MANDATORY_FIELDS.PHONE_NUMBER],
      ENROLMENT_FIELDS.SERVICE_LANGUAGE,
    ],
    [['not-exist'], ENROLMENT_FIELDS.SERVICE_LANGUAGE],
  ];

  it.each(falseCases)(
    'should return false if field is not mandatory with args %p, result %p',
    (mandatory_fields, field) =>
      expect(
        isEnrolmentFieldRequired(fakeRegistration({ mandatory_fields }), field)
      ).toBe(false)
  );

  const trueCases: [string[], ENROLMENT_FIELDS][] = [
    [
      [REGISTRATION_MANDATORY_FIELDS.PHONE_NUMBER],
      ENROLMENT_FIELDS.PHONE_NUMBER,
    ],
  ];

  it.each(trueCases)(
    'should return false if field is not mandatory with args %p, result %p',
    (mandatory_fields, field) =>
      expect(
        isEnrolmentFieldRequired(fakeRegistration({ mandatory_fields }), field)
      ).toBe(true)
  );
});
