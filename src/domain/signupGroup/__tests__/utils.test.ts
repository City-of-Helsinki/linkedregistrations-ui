import {
  fakeContactPerson,
  fakeRegistration,
  fakeSignup,
  fakeSignupGroup,
} from '../../../utils/mockDataUtils';
import { registration } from '../../registration/__mocks__/registration';
import {
  REGISTRATION_MANDATORY_FIELDS,
  TEST_REGISTRATION_ID,
} from '../../registration/constants';
import {
  NOTIFICATION_TYPE,
  TEST_CONTACT_PERSON_ID,
  TEST_SIGNUP_ID,
} from '../../signup/constants';
import {
  CONTACT_PERSON_FIELDS,
  NOTIFICATIONS,
  SIGNUP_GROUP_FIELDS,
  SIGNUP_GROUP_INITIAL_VALUES,
  SIGNUP_INITIAL_VALUES,
  TEST_SIGNUP_GROUP_ID,
} from '../constants';
import {
  CreateSignupGroupMutationInput,
  SignupGroupQueryVariables,
} from '../types';
import {
  getSignupDefaultInitialValues,
  getSignupGroupDefaultInitialValues,
  getSignupGroupInitialValues,
  getSignupGroupPayload,
  getSignupNotificationTypes,
  getSignupNotificationsCode,
  getUpdateSignupGroupPayload,
  omitSensitiveDataFromSignupGroupPayload,
  isSignupFieldRequired,
  signupGroupPathBuilder,
} from '../utils';

describe('getSignupGroupPayload function', () => {
  const reservationCode = 'code';

  it('should return signup group payload', () => {
    expect(
      getSignupGroupPayload({
        formValues: {
          ...SIGNUP_GROUP_INITIAL_VALUES,
          signups: [SIGNUP_INITIAL_VALUES],
        },
        registration,
        reservationCode,
      })
    ).toEqual({
      extra_info: '',
      registration: registration.id,
      reservation_code: 'code',
      signups: [
        {
          city: '',
          date_of_birth: null,
          email: null,
          extra_info: '',
          first_name: '',
          last_name: '',
          membership_number: '',
          native_language: null,
          notifications: NOTIFICATION_TYPE.EMAIL,
          phone_number: null,
          responsible_for_group: true,
          service_language: null,
          street_address: null,
          zipcode: null,
          user_consent: false,
        },
      ],
    });

    const city = 'City',
      contactPersonFirstName = 'First name',
      contactPersonLastName = 'First name',
      dateOfBirth = '10.10.1999',
      email = 'Email',
      extraInfo = 'Extra info',
      firstName = 'First name',
      groupExtraInfo = 'Group extra info',
      lastName = 'Last name',
      membershipNumber = 'XXX-123',
      nativeLanguage = 'fi',
      notifications = [NOTIFICATIONS.EMAIL],
      phoneNumber = '0441234567',
      serviceLanguage = 'sv',
      streetAddress = 'Street address',
      userConsent = true,
      zipcode = '00100';
    const payload = getSignupGroupPayload({
      formValues: {
        ...SIGNUP_GROUP_INITIAL_VALUES,
        contactPerson: {
          email,
          firstName: contactPersonFirstName,
          id: null,
          lastName: contactPersonLastName,
          membershipNumber,
          nativeLanguage,
          notifications,
          phoneNumber,
          serviceLanguage,
        },
        signups: [
          {
            city,
            dateOfBirth,
            extraInfo,
            firstName,
            id: TEST_SIGNUP_ID,
            inWaitingList: false,
            lastName,
            responsibleForGroup: false,
            streetAddress,
            zipcode,
          },
        ],

        extraInfo: groupExtraInfo,
        userConsent,
      },
      registration,
      reservationCode,
    });

    expect(payload).toEqual({
      extra_info: groupExtraInfo,
      registration: registration.id,
      reservation_code: reservationCode,
      signups: [
        {
          city,
          date_of_birth: '1999-10-10',
          email,
          extra_info: extraInfo,
          first_name: firstName,
          id: TEST_SIGNUP_ID,
          last_name: lastName,
          membership_number: membershipNumber,
          native_language: nativeLanguage,
          notifications: NOTIFICATION_TYPE.EMAIL,
          phone_number: phoneNumber,
          responsible_for_group: true,
          service_language: serviceLanguage,
          street_address: streetAddress,
          user_consent: userConsent,
          zipcode,
        },
      ],
    });
  });
});
describe('getSignupNotificationsCode function', () => {
  it('should return correct notification core', () => {
    expect(getSignupNotificationsCode([])).toBe(
      NOTIFICATION_TYPE.NO_NOTIFICATION
    );
    expect(getSignupNotificationsCode([NOTIFICATIONS.SMS])).toBe(
      NOTIFICATION_TYPE.SMS
    );
    expect(getSignupNotificationsCode([NOTIFICATIONS.EMAIL])).toBe(
      NOTIFICATION_TYPE.EMAIL
    );
    expect(
      getSignupNotificationsCode([NOTIFICATIONS.EMAIL, NOTIFICATIONS.SMS])
    ).toBe(NOTIFICATION_TYPE.SMS_EMAIL);
  });
});

describe('getSignupNotificationTypes function', () => {
  it('should return correct notification types', () => {
    expect(
      getSignupNotificationTypes(NOTIFICATION_TYPE.NO_NOTIFICATION)
    ).toEqual([]);
    expect(getSignupNotificationTypes(NOTIFICATION_TYPE.SMS)).toEqual([
      NOTIFICATIONS.SMS,
    ]);
    expect(getSignupNotificationTypes(NOTIFICATION_TYPE.EMAIL)).toEqual([
      NOTIFICATIONS.EMAIL,
    ]);
    expect(getSignupNotificationTypes(NOTIFICATION_TYPE.SMS_EMAIL)).toEqual([
      NOTIFICATIONS.EMAIL,
      NOTIFICATIONS.SMS,
    ]);
    expect(getSignupNotificationTypes('lorem ipsum')).toEqual([]);
  });
});

describe('getSignupDefaultInitialValues function', () => {
  it('should return signup initial values', () => {
    expect(getSignupDefaultInitialValues()).toEqual({
      city: '',
      dateOfBirth: '',
      extraInfo: '',
      firstName: '',
      id: null,
      inWaitingList: false,
      lastName: '',
      responsibleForGroup: false,
      streetAddress: '',
      zipcode: '',
    });
  });
});

describe('getSignupGroupDefaultInitialValues function', () => {
  it('should return signup group default initial values', () => {
    expect(getSignupGroupDefaultInitialValues()).toEqual({
      contactPerson: {
        email: '',
        firstName: '',
        id: null,
        lastName: '',
        membershipNumber: '',
        nativeLanguage: '',
        notifications: [NOTIFICATIONS.EMAIL],
        phoneNumber: '',
        serviceLanguage: '',
      },
      extraInfo: '',
      signups: [
        {
          city: '',
          dateOfBirth: '',
          extraInfo: '',
          firstName: '',
          id: null,
          inWaitingList: false,
          lastName: '',
          responsibleForGroup: false,
          streetAddress: '',
          zipcode: '',
        },
      ],
      userConsent: false,
    });
  });
});

describe('getSignupGroupInitialValues function', () => {
  it('should return default values if value is not set', () => {
    const {
      contactPerson: {
        email,
        membershipNumber,
        nativeLanguage,
        notifications,
        phoneNumber,
        serviceLanguage,
      },
      extraInfo,
      signups,
    } = getSignupGroupInitialValues(
      fakeSignupGroup({
        contact_person: fakeContactPerson({
          email: null,
          first_name: null,
          id: TEST_CONTACT_PERSON_ID,
          last_name: null,
          membership_number: null,
          native_language: null,
          notifications: NOTIFICATION_TYPE.EMAIL,
          phone_number: null,
          service_language: null,
        }),
        extra_info: null,
        signups: [
          fakeSignup({
            city: null,
            contact_person: null,
            date_of_birth: null,
            extra_info: null,
            first_name: null,
            id: TEST_SIGNUP_ID,
            last_name: null,
            responsible_for_group: true,
            street_address: null,
            zipcode: null,
          }),
        ],
      })
    );

    expect(signups).toEqual([
      {
        city: '',
        dateOfBirth: '',
        extraInfo: '',
        firstName: '',
        id: TEST_SIGNUP_ID,
        inWaitingList: false,
        lastName: '',
        responsibleForGroup: true,
        streetAddress: '',
        zipcode: '',
      },
    ]);
    expect(email).toBe('');
    expect(extraInfo).toBe('');
    expect(membershipNumber).toBe('');
    expect(nativeLanguage).toBe('');
    expect(notifications).toEqual([NOTIFICATIONS.EMAIL]);
    expect(phoneNumber).toBe('');
    expect(serviceLanguage).toBe('');
  });

  it('should return signup group initial values', () => {
    const expectedCity = 'City';
    const expectedContactPersonFirstName = 'First name';
    const expectedContactPersonLastName = 'Last name';
    const expectedDateOfBirth = '10.10.2021';
    const expectedEmail = 'user@email.com';
    const expectedExtraInfo = 'Extra info';
    const expectedGroupExtraInfo = 'Group extra info';
    const expectedFirstName = 'First name';
    const expectedLastName = 'Last name';
    const expectedMembershipNumber = 'XXX-XXX-XXX';
    const expectedNativeLanguage = 'fi';
    const expectedNotifications = [NOTIFICATIONS.EMAIL];
    const expectedPhoneNumber = '+358 44 123 4567';
    const expectedServiceLanguage = 'sv';
    const expectedStreetAddress = 'Test address';
    const expectedZip = '12345';

    const {
      contactPerson: {
        email,
        firstName: contactPersonFirstName,
        lastName: contactPersonLastName,
        membershipNumber,
        nativeLanguage,
        notifications,
        phoneNumber,
        serviceLanguage,
      },
      extraInfo,
      signups,
    } = getSignupGroupInitialValues(
      fakeSignupGroup({
        contact_person: fakeContactPerson({
          email: expectedEmail,
          first_name: expectedContactPersonFirstName,
          id: TEST_CONTACT_PERSON_ID,
          last_name: expectedContactPersonLastName,
          membership_number: expectedMembershipNumber,
          native_language: expectedNativeLanguage,
          notifications: NOTIFICATION_TYPE.EMAIL,
          phone_number: expectedPhoneNumber,
          service_language: expectedServiceLanguage,
        }),
        extra_info: expectedGroupExtraInfo,
        signups: [
          fakeSignup({
            city: expectedCity,
            date_of_birth: '2021-10-10',
            extra_info: expectedExtraInfo,
            first_name: expectedFirstName,
            id: TEST_SIGNUP_ID,
            last_name: expectedLastName,
            responsible_for_group: true,
            street_address: expectedStreetAddress,
            zipcode: expectedZip,
          }),
        ],
      })
    );

    expect(signups).toEqual([
      {
        city: expectedCity,
        dateOfBirth: expectedDateOfBirth,
        extraInfo: expectedExtraInfo,
        firstName: expectedFirstName,
        id: TEST_SIGNUP_ID,
        inWaitingList: false,
        lastName: expectedLastName,
        responsibleForGroup: true,
        streetAddress: expectedStreetAddress,
        zipcode: expectedZip,
      },
    ]);
    expect(email).toBe(expectedEmail);
    expect(contactPersonFirstName).toBe(expectedContactPersonFirstName);
    expect(contactPersonLastName).toBe(expectedContactPersonLastName);
    expect(email).toBe(expectedEmail);
    expect(extraInfo).toBe(expectedGroupExtraInfo);
    expect(membershipNumber).toBe(expectedMembershipNumber);
    expect(nativeLanguage).toBe(expectedNativeLanguage);
    expect(notifications).toEqual(expectedNotifications);
    expect(phoneNumber).toBe(expectedPhoneNumber);
    expect(serviceLanguage).toBe(expectedServiceLanguage);
  });

  it('should sort singnups so that items where responsibleForGroup is true are at the start', () => {
    const signup1 = fakeSignup({
      id: 'signup:1',
      responsible_for_group: false,
    });
    const signup2 = fakeSignup({ id: 'signup:2', responsible_for_group: true });
    const signup3 = fakeSignup({ id: 'signup:3', responsible_for_group: true });
    const signup4 = fakeSignup({
      id: 'signup:4',
      responsible_for_group: false,
    });
    const signupGroup = fakeSignupGroup({
      signups: [signup1, signup2, signup3, signup4],
    });

    const initialValues = getSignupGroupInitialValues(signupGroup);
    expect(initialValues.signups[0].id).toEqual(signup2.id);
    expect(initialValues.signups[1].id).toEqual(signup3.id);
    expect(initialValues.signups[2].id).toEqual(signup1.id);
    expect(initialValues.signups[3].id).toEqual(signup4.id);
  });

  it('should set userConsent false if any signups has user_consent false', () => {
    const signup1 = fakeSignup({ user_consent: false });
    const signup2 = fakeSignup({ user_consent: true });
    const signupGroup = fakeSignupGroup({
      signups: [signup1, signup2],
    });

    const { userConsent } = getSignupGroupInitialValues(signupGroup);
    expect(userConsent).toBeFalsy();
  });

  it('should set userConsent true if all signups has user_consent true', () => {
    const signup1 = fakeSignup({ user_consent: true });
    const signup2 = fakeSignup({ user_consent: true });
    const signupGroup = fakeSignupGroup({
      signups: [signup1, signup2],
    });

    const { userConsent } = getSignupGroupInitialValues(signupGroup);
    expect(userConsent).toBeTruthy();
  });
});

describe('isSignupFieldRequired', () => {
  const falseCases: [string[], CONTACT_PERSON_FIELDS | SIGNUP_GROUP_FIELDS][] =
    [
      [
        [REGISTRATION_MANDATORY_FIELDS.PHONE_NUMBER],
        CONTACT_PERSON_FIELDS.EMAIL,
      ],
      [
        [REGISTRATION_MANDATORY_FIELDS.PHONE_NUMBER],
        SIGNUP_GROUP_FIELDS.EXTRA_INFO,
      ],
      [
        [REGISTRATION_MANDATORY_FIELDS.PHONE_NUMBER],
        CONTACT_PERSON_FIELDS.MEMBERSHIP_NUMBER,
      ],
      [
        [REGISTRATION_MANDATORY_FIELDS.PHONE_NUMBER],
        CONTACT_PERSON_FIELDS.NATIVE_LANGUAGE,
      ],
      [
        [REGISTRATION_MANDATORY_FIELDS.PHONE_NUMBER],
        CONTACT_PERSON_FIELDS.SERVICE_LANGUAGE,
      ],
      [['not-exist'], CONTACT_PERSON_FIELDS.SERVICE_LANGUAGE],
    ];

  it.each(falseCases)(
    'should return false if field is not mandatory with args %p, result %p',
    (mandatory_fields, field) =>
      expect(
        isSignupFieldRequired(fakeRegistration({ mandatory_fields }), field)
      ).toBe(false)
  );

  const trueCases: [string[], CONTACT_PERSON_FIELDS | SIGNUP_GROUP_FIELDS][] = [
    [
      [REGISTRATION_MANDATORY_FIELDS.PHONE_NUMBER],
      CONTACT_PERSON_FIELDS.PHONE_NUMBER,
    ],
  ];

  it.each(trueCases)(
    'should return false if field is not mandatory with args %p, result %p',
    (mandatory_fields, field) =>
      expect(
        isSignupFieldRequired(fakeRegistration({ mandatory_fields }), field)
      ).toBe(true)
  );
});

describe('signupGroupPathBuilder function', () => {
  const cases: [SignupGroupQueryVariables, string][] = [
    [{ id: 'signupGroup:1' }, '/signup_group/signupGroup:1/'],
  ];

  it.each(cases)('should build correct path', (variables, expectedPath) =>
    expect(signupGroupPathBuilder(variables)).toBe(expectedPath)
  );
});

describe('getUpdateSignupGroupPayload function', () => {
  it('should return signup group payload default values', () => {
    expect(
      getUpdateSignupGroupPayload({
        formValues: {
          ...SIGNUP_GROUP_INITIAL_VALUES,
          signups: [{ ...SIGNUP_INITIAL_VALUES }],
        },
        id: TEST_SIGNUP_GROUP_ID,
        registration,
      })
    ).toEqual({
      extra_info: '',
      id: TEST_SIGNUP_GROUP_ID,
      registration: TEST_REGISTRATION_ID,
      signups: [
        {
          city: '',
          date_of_birth: null,
          email: null,
          extra_info: '',
          first_name: '',
          last_name: '',
          membership_number: '',
          native_language: null,
          notifications: NOTIFICATION_TYPE.EMAIL,
          phone_number: null,
          responsible_for_group: false,
          service_language: null,
          street_address: null,
          zipcode: null,
          user_consent: false,
        },
      ],
    });
  });

  it('should return signup group payload', () => {
    const city = 'City',
      contactPersonFirstName = 'First name',
      contactPersonLastName = 'Last name',
      dateOfBirth = '10.10.1999',
      email = 'Email',
      extraInfo = 'Extra info',
      groupExtraInfo = 'Group extra info',
      firstName = 'First name',
      lastName = 'Last name',
      membershipNumber = 'XXX-123',
      nativeLanguage = 'fi',
      notifications = [NOTIFICATIONS.EMAIL],
      phoneNumber = '0441234567',
      serviceLanguage = 'sv',
      streetAddress = 'Street address',
      userConsent = true,
      zipcode = '00100';
    const signups = [
      {
        city,
        dateOfBirth,
        extraInfo,
        firstName,
        id: TEST_SIGNUP_ID,
        inWaitingList: false,
        lastName,
        responsibleForGroup: true,
        streetAddress,
        zipcode,
      },
    ];

    const payload = getUpdateSignupGroupPayload({
      formValues: {
        ...SIGNUP_GROUP_INITIAL_VALUES,
        contactPerson: {
          email,
          firstName: contactPersonFirstName,
          id: TEST_CONTACT_PERSON_ID,
          lastName: contactPersonLastName,
          membershipNumber,
          nativeLanguage,
          notifications,
          phoneNumber,
          serviceLanguage,
        },
        extraInfo: groupExtraInfo,
        signups,
        userConsent,
      },
      id: TEST_SIGNUP_GROUP_ID,
      registration,
    });

    expect(payload).toEqual({
      extra_info: groupExtraInfo,
      id: TEST_SIGNUP_GROUP_ID,
      registration: TEST_REGISTRATION_ID,
      signups: [
        {
          city,
          date_of_birth: '1999-10-10',
          email,
          extra_info: extraInfo,
          first_name: firstName,
          id: TEST_SIGNUP_ID,
          last_name: lastName,
          membership_number: membershipNumber,
          native_language: nativeLanguage,
          notifications: NOTIFICATION_TYPE.EMAIL,
          phone_number: phoneNumber,
          responsible_for_group: true,
          service_language: serviceLanguage,
          street_address: streetAddress,
          zipcode,
          user_consent: userConsent,
        },
      ],
    });
  });
});

describe('omitSensitiveDataFromSignupGroupPayload', () => {
  it('should omit sensitive data from payload', () => {
    const payload: CreateSignupGroupMutationInput = {
      extra_info: 'Extra info',
      registration: registration.id,
      reservation_code: 'xxx',
      signups: [
        {
          city: 'Helsinki',
          date_of_birth: '1999-10-10',
          email: 'test@email.com',
          extra_info: 'Signup entra info',
          first_name: 'First name',
          id: '1',
          last_name: 'Last name',
          membership_number: 'XYZ',
          native_language: 'fi',
          notifications: NOTIFICATION_TYPE.EMAIL,
          phone_number: '0441234567',
          responsible_for_group: true,
          service_language: 'fi',
          street_address: 'Address',
          zipcode: '123456',
          user_consent: true,
        },
      ],
    };

    const filteredPayload = omitSensitiveDataFromSignupGroupPayload(
      payload
    ) as CreateSignupGroupMutationInput;
    expect(filteredPayload).toEqual({
      registration: registration.id,
      reservation_code: 'xxx',
      signups: [
        {
          id: '1',
          notifications: NOTIFICATION_TYPE.EMAIL,
          responsible_for_group: true,
          user_consent: true,
        },
      ],
    });
    expect(filteredPayload.extra_info).toBeUndefined();
    expect(filteredPayload.signups[0].city).toBeUndefined();
    expect(filteredPayload.signups[0].email).toBeUndefined();
    expect(filteredPayload.signups[0].extra_info).toBeUndefined();
    expect(filteredPayload.signups[0].first_name).toBeUndefined();
    expect(filteredPayload.signups[0].last_name).toBeUndefined();
    expect(filteredPayload.signups[0].membership_number).toBeUndefined();
    expect(filteredPayload.signups[0].native_language).toBeUndefined();
    expect(filteredPayload.signups[0].phone_number).toBeUndefined();
    expect(filteredPayload.signups[0].service_language).toBeUndefined();
    expect(filteredPayload.signups[0].street_address).toBeUndefined();
    expect(filteredPayload.signups[0].zipcode).toBeUndefined();
  });
});
