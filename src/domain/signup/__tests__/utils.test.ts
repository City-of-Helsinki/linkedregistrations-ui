import { fakeSignup } from '../../../utils/mockDataUtils';
import { NOTIFICATIONS } from '../../signupGroup/constants';
import { NOTIFICATION_TYPE, TEST_SIGNUP_ID } from '../constants';
import { SignupQueryVariables } from '../types';
import {
  getSignupGroupInitialValuesFromSignup,
  getSignupFields,
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
