import { fakeSignup } from '../../../utils/mockDataUtils';
import { registration } from '../../registration/__mocks__/registration';
import {
  NOTIFICATIONS,
  SIGNUP_GROUP_INITIAL_VALUES,
} from '../../signupGroup/constants';
import { NOTIFICATION_TYPE, TEST_SIGNUP_ID } from '../constants';
import { SignupInput, SignupQueryVariables } from '../types';
import {
  getSignupFields,
  getSignupGroupInitialValuesFromSignup,
  getUpdateSignupPayload,
  omitSensitiveDataFromSignupPayload,
  signupPathBuilder,
} from '../utils';

describe('signupPathBuilder function', () => {
  const cases: [SignupQueryVariables, string][] = [
    [{ id: 'signup:1' }, '/signup/signup:1/'],
  ];

  it.each(cases)('should build correct path', (variables, expectedPath) =>
    expect(signupPathBuilder(variables)).toBe(expectedPath)
  );
});

describe('getSignupFields function', () => {
  it('should return empty string for each field if value is null', () => {
    const { firstName, fullName, lastName } = getSignupFields({
      signup: fakeSignup({ first_name: null, last_name: null }),
    });
    expect(firstName).toBe('');
    expect(fullName).toBe('');
    expect(lastName).toBe('');
  });

  it('should return correct signup fields', () => {
    const { firstName, fullName, lastName } = getSignupFields({
      signup: fakeSignup({ first_name: 'Test', last_name: 'User' }),
    });
    expect(firstName).toBe('Test');
    expect(fullName).toBe('Test User');
    expect(lastName).toBe('User');
  });
});

describe('getSignupGroupInitialValuesFromSignup function', () => {
  it('should return default values if value is not set', () => {
    const {
      email,
      extraInfo,
      membershipNumber,
      nativeLanguage,
      notifications,
      phoneNumber,
      serviceLanguage,
      signups,
    } = getSignupGroupInitialValuesFromSignup(
      fakeSignup({
        city: null,
        date_of_birth: null,
        email: null,
        extra_info: null,
        first_name: null,
        id: TEST_SIGNUP_ID,
        last_name: null,
        membership_number: null,
        native_language: null,
        notifications: NOTIFICATION_TYPE.EMAIL,
        phone_number: null,
        responsible_for_group: true,
        service_language: null,
        street_address: null,
        zipcode: null,
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
    const expectedDateOfBirth = '10.10.2021';
    const expectedEmail = 'user@email.com';
    const expectedExtraInfo = 'Extra info';
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
      email,
      extraInfo,
      membershipNumber,
      nativeLanguage,
      notifications,
      phoneNumber,
      serviceLanguage,
      signups,
    } = getSignupGroupInitialValuesFromSignup(
      fakeSignup({
        city: expectedCity,
        date_of_birth: '2021-10-10',
        email: expectedEmail,
        extra_info: expectedExtraInfo,
        first_name: expectedFirstName,
        id: TEST_SIGNUP_ID,
        last_name: expectedLastName,
        membership_number: expectedMembershipNumber,
        native_language: expectedNativeLanguage,
        notifications: NOTIFICATION_TYPE.EMAIL,
        phone_number: expectedPhoneNumber,
        responsible_for_group: true,
        service_language: expectedServiceLanguage,
        street_address: expectedStreetAddress,
        zipcode: expectedZip,
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
    expect(extraInfo).toBe('');
    expect(membershipNumber).toBe(expectedMembershipNumber);
    expect(nativeLanguage).toBe(expectedNativeLanguage);
    expect(notifications).toEqual(expectedNotifications);
    expect(phoneNumber).toBe(expectedPhoneNumber);
    expect(serviceLanguage).toBe(expectedServiceLanguage);
  });
});

describe('getUpdateSignupPayload function', () => {
  it('should return payload to update a signup', () => {
    expect(
      getUpdateSignupPayload({
        formValues: SIGNUP_GROUP_INITIAL_VALUES,
        id: TEST_SIGNUP_ID,
        registration,
      })
    ).toEqual({
      city: '',
      date_of_birth: null,
      email: null,
      extra_info: '',
      first_name: '',
      id: TEST_SIGNUP_ID,
      last_name: '',
      membership_number: '',
      native_language: null,
      notifications: NOTIFICATION_TYPE.EMAIL,
      phone_number: null,
      registration: registration.id,
      responsible_for_group: false,
      service_language: null,
      street_address: null,
      zipcode: null,
    });

    const city = 'City',
      dateOfBirth = '10.10.1999',
      email = 'Email',
      extraInfo = 'Extra info',
      firstName = 'First name',
      lastName = 'Last name',
      membershipNumber = 'XXX-123',
      nativeLanguage = 'fi',
      notifications = [NOTIFICATIONS.EMAIL],
      phoneNumber = '0441234567',
      serviceLanguage = 'sv',
      streetAddress = 'Street address',
      zipcode = '00100';
    const signups = [
      {
        city,
        dateOfBirth,
        extraInfo,
        firstName,
        id: null,
        inWaitingList: false,
        lastName,
        responsibleForGroup: true,
        streetAddress,
        zipcode,
      },
    ];
    const payload = getUpdateSignupPayload({
      formValues: {
        ...SIGNUP_GROUP_INITIAL_VALUES,
        email,
        extraInfo: '',
        membershipNumber,
        nativeLanguage,
        notifications,
        phoneNumber,
        serviceLanguage,
        signups,
      },
      id: TEST_SIGNUP_ID,
      registration,
    });

    expect(payload).toEqual({
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
      registration: registration.id,
      responsible_for_group: true,
      service_language: serviceLanguage,
      street_address: streetAddress,
      zipcode,
    });
  });
});

describe('omitSensitiveDataFromSignupPayload', () => {
  it('should omit sensitive data from payload', () => {
    const payload: SignupInput = {
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
    };

    const filteredPayload = omitSensitiveDataFromSignupPayload(
      payload
    ) as SignupInput;
    expect(filteredPayload).toEqual({
      id: '1',
      notifications: NOTIFICATION_TYPE.EMAIL,
      responsible_for_group: true,
    });
    expect(filteredPayload.city).toBeUndefined();
    expect(filteredPayload.extra_info).toBeUndefined();
    expect(filteredPayload.email).toBeUndefined();
    expect(filteredPayload.extra_info).toBeUndefined();
    expect(filteredPayload.first_name).toBeUndefined();
    expect(filteredPayload.last_name).toBeUndefined();
    expect(filteredPayload.membership_number).toBeUndefined();
    expect(filteredPayload.native_language).toBeUndefined();
    expect(filteredPayload.phone_number).toBeUndefined();
    expect(filteredPayload.service_language).toBeUndefined();
    expect(filteredPayload.street_address).toBeUndefined();
    expect(filteredPayload.zipcode).toBeUndefined();
  });
});
