/* eslint-disable @typescript-eslint/no-explicit-any */
import i18n from 'i18next';
import { advanceTo, clear } from 'jest-date-mock';

import {
  fakeEvent,
  fakeSignup,
  fakeSignupGroup,
  fakeSignupPaymentCancellation,
  fakeSignupPaymentRefund,
  fakeSignupPriceGroup,
} from '../../../utils/mockDataUtils';
import { Event } from '../../event/types';
import { registration } from '../../registration/__mocks__/registration';
import {
  NOTIFICATIONS,
  SIGNUP_GROUP_INITIAL_VALUES,
  TEST_SIGNUP_GROUP_ID,
} from '../../signupGroup/constants';
import { SignupGroup } from '../../signupGroup/types';
import {
  ATTENDEE_STATUS,
  NOTIFICATION_TYPE,
  TEST_CONTACT_PERSON_ID,
  TEST_SIGNUP_ID,
} from '../constants';
import { Signup, SignupInput, SignupQueryVariables } from '../types';
import {
  canCancelSignup,
  canEditSignup,
  getCancelSignupWarning,
  getEditSignupWarning,
  getSignupFields,
  getSignupGroupInitialValuesFromSignup,
  getUpdateSignupPayload,
  omitSensitiveDataFromSignupPayload,
  signupPathBuilder,
} from '../utils';

const editableSignupOverride = {
  has_contact_person_access: true,
  is_created_by_current_user: true,
};

afterEach(() => {
  clear();
});

describe('canEditSignup function', () => {
  const cases: [Signup, SignupGroup | undefined, boolean][] = [
    [
      fakeSignup({
        has_contact_person_access: false,
        is_created_by_current_user: false,
      }),
      undefined,
      false,
    ],
    [
      fakeSignup({
        has_contact_person_access: true,
        is_created_by_current_user: false,
      }),
      undefined,
      true,
    ],
    [
      fakeSignup({
        has_contact_person_access: false,
        is_created_by_current_user: true,
      }),
      undefined,
      true,
    ],
    [fakeSignup(editableSignupOverride), undefined, true],
    [
      fakeSignup({
        ...editableSignupOverride,
        payment_cancellation: fakeSignupPaymentCancellation(),
      }),
      undefined,
      false,
    ],
    [
      fakeSignup({
        ...editableSignupOverride,
        payment_refund: fakeSignupPaymentRefund(),
      }),
      undefined,
      false,
    ],
    [
      fakeSignup(editableSignupOverride),
      fakeSignupGroup({
        payment_cancellation: fakeSignupPaymentCancellation(),
      }),
      false,
    ],
    [
      fakeSignup(editableSignupOverride),
      fakeSignupGroup({
        payment_refund: fakeSignupPaymentRefund(),
      }),
      false,
    ],
  ];

  it.each(cases)(
    'should return true if signup can be edited',
    (signup, signupGroup, expectedResult) =>
      expect(canEditSignup(signup, signupGroup)).toBe(expectedResult)
  );
});

describe('canEditSignup function', () => {
  const cases: [Signup, SignupGroup | undefined, string][] = [
    [fakeSignup(editableSignupOverride), undefined, ''],
    [
      fakeSignup({
        has_contact_person_access: false,
        is_created_by_current_user: false,
      }),
      undefined,
      'Sinulla ei ole oikeuksia muokata ilmoittautumisen tietoja.',
    ],
    [
      fakeSignup({
        ...editableSignupOverride,
        payment_cancellation: fakeSignupPaymentCancellation(),
      }),
      undefined,
      'Ilmoittautumisen maksua perutaan eikä sitä voi muokata.',
    ],
    [
      fakeSignup({
        ...editableSignupOverride,
        payment_refund: fakeSignupPaymentRefund(),
      }),
      undefined,
      'Ilmoittautumisen maksua hyvitetään eikä sitä voi muokata.',
    ],
    [
      fakeSignup(editableSignupOverride),
      fakeSignupGroup({
        payment_cancellation: fakeSignupPaymentCancellation(),
      }),
      'Ilmoittautumisen maksua perutaan eikä sitä voi muokata.',
    ],
    [
      fakeSignup(editableSignupOverride),
      fakeSignupGroup({
        payment_refund: fakeSignupPaymentRefund(),
      }),
      'Ilmoittautumisen maksua hyvitetään eikä sitä voi muokata.',
    ],
  ];

  it.each(cases)(
    'should return correct edit signup warning',
    (signup, signupGroup, expectedResult) =>
      expect(
        getEditSignupWarning({ signup, signupGroup, t: i18n.t.bind(i18n) })
      ).toBe(expectedResult)
  );
});

describe('canECancelSignup function', () => {
  const editableEvent = fakeEvent({ start_time: '2024-06-24' });
  const cases: [Signup, SignupGroup | undefined, Event, boolean][] = [
    [
      fakeSignup({
        has_contact_person_access: false,
        is_created_by_current_user: false,
      }),
      undefined,
      editableEvent,
      false,
    ],
    [
      fakeSignup({
        has_contact_person_access: true,
        is_created_by_current_user: false,
      }),
      undefined,
      editableEvent,
      true,
    ],
    [
      fakeSignup({
        has_contact_person_access: false,
        is_created_by_current_user: true,
      }),
      undefined,
      editableEvent,
      true,
    ],
    [fakeSignup(editableSignupOverride), undefined, editableEvent, true],
    [
      fakeSignup({
        ...editableSignupOverride,
        payment_cancellation: fakeSignupPaymentCancellation(),
      }),
      undefined,
      editableEvent,
      false,
    ],
    [
      fakeSignup({
        ...editableSignupOverride,
        payment_refund: fakeSignupPaymentRefund(),
      }),
      undefined,
      editableEvent,
      false,
    ],
    [
      fakeSignup(editableSignupOverride),
      fakeSignupGroup({
        payment_cancellation: fakeSignupPaymentCancellation(),
      }),
      editableEvent,
      false,
    ],
    [
      fakeSignup(editableSignupOverride),
      fakeSignupGroup({
        payment_refund: fakeSignupPaymentRefund(),
      }),
      editableEvent,
      false,
    ],
    [
      fakeSignup(editableSignupOverride),
      undefined,
      fakeEvent({ start_time: '2024-01-01' }),
      false,
    ],
  ];

  it.each(cases)(
    'should return true if signup can be cancelled',
    (signup, signupGroup, event, expectedResult) => {
      advanceTo('2024-06-01');
      expect(canCancelSignup({ event, signup, signupGroup })).toBe(
        expectedResult
      );
    }
  );
});

describe('canEditSignup function', () => {
  const editableEvent = fakeEvent({ start_time: '2024-06-24' });
  const cases: [Signup, SignupGroup | undefined, Event, string][] = [
    [fakeSignup(editableSignupOverride), undefined, editableEvent, ''],
    [
      fakeSignup({
        has_contact_person_access: false,
        is_created_by_current_user: false,
      }),
      undefined,
      editableEvent,
      'Sinulla ei ole oikeuksia muokata ilmoittautumisen tietoja.',
    ],
    [
      fakeSignup({
        ...editableSignupOverride,
        payment_cancellation: fakeSignupPaymentCancellation(),
      }),
      undefined,
      editableEvent,
      'Ilmoittautumisen maksua perutaan eikä sitä voi muokata.',
    ],
    [
      fakeSignup({
        ...editableSignupOverride,
        payment_refund: fakeSignupPaymentRefund(),
      }),
      undefined,
      editableEvent,
      'Ilmoittautumisen maksua hyvitetään eikä sitä voi muokata.',
    ],
    [
      fakeSignup(editableSignupOverride),
      fakeSignupGroup({
        payment_cancellation: fakeSignupPaymentCancellation(),
      }),
      editableEvent,
      'Ilmoittautumisen maksua perutaan eikä sitä voi muokata.',
    ],
    [
      fakeSignup(editableSignupOverride),
      fakeSignupGroup({
        payment_refund: fakeSignupPaymentRefund(),
      }),
      editableEvent,
      'Ilmoittautumisen maksua hyvitetään eikä sitä voi muokata.',
    ],
    [
      fakeSignup(editableSignupOverride),
      undefined,
      fakeEvent({ start_time: '2024-01-01' }),
      'Tapahtuman on jo alkanut eikä ilmoittautumista voi perua.',
    ],
    [
      fakeSignup(editableSignupOverride),
      undefined,
      fakeEvent({ start_time: null }),
      '',
    ],
  ];

  it.each(cases)(
    'should return correct cancel signup warning',
    (signup, signupGroup, event, expectedResult) => {
      advanceTo('2024-06-01');
      expect(
        getCancelSignupWarning({
          event,
          signup,
          signupGroup,
          t: i18n.t.bind(i18n),
        })
      ).toBe(expectedResult);
    }
  );
});

describe('signupPathBuilder function', () => {
  const cases: [SignupQueryVariables, string][] = [
    [{ id: 'signup:1' }, '/signup/signup:1/'],
    [
      { id: 'signup:1', accessCode: 'access-code' },
      '/signup/signup:1/?access_code=access-code',
    ],
  ];

  it.each(cases)('should build correct path', (variables, expectedPath) =>
    expect(signupPathBuilder(variables)).toBe(expectedPath)
  );
});

describe('getSignupFields function', () => {
  it('should return default values if value is not set', () => {
    const {
      attendeeStatus,
      contactPersonEmail,
      contactPersonPhoneNumber,
      firstName,
      lastName,
      phoneNumber,
    } = getSignupFields({
      signup: fakeSignup({
        attendee_status: null as unknown as undefined,
        contact_person: {
          email: null,
          first_name: null,
          last_name: null,
          id: '',
          phone_number: null,
        },
        first_name: null,
        id: '',
        last_name: null,
        phone_number: null,
      }),
    });

    expect(attendeeStatus).toBe(ATTENDEE_STATUS.Attending);
    expect(contactPersonEmail).toBe('');
    expect(contactPersonPhoneNumber).toBe('');
    expect(firstName).toBe('');
    expect(lastName).toBe('');
    expect(phoneNumber).toBe('');
  });

  it('should return correct signupfields', () => {
    expect(
      getSignupFields({
        signup: fakeSignup({
          contact_person: {
            email: 'contact@email.com',
            first_name: 'Contact person first name',
            last_name: 'Contact person last name',
            id: '',
            phone_number: '0401234567',
          },
          first_name: 'First name',
          id: TEST_SIGNUP_ID,
          last_name: 'Last name',
          phone_number: '0407654321',
          signup_group: TEST_SIGNUP_GROUP_ID,
        }),
      })
    ).toEqual({
      attendeeStatus: 'attending',
      contactPersonEmail: 'contact@email.com',
      contactPersonPhoneNumber: '0401234567',
      firstName: 'First name',
      fullName: 'First name Last name',
      lastName: 'Last name',
      phoneNumber: '0407654321',
      signupGroup: 'signupGroup:1',
    });
  });
});

describe('getSignupGroupInitialValuesFromSignup function', () => {
  it('should return default values if value is not set', () => {
    expect(
      getSignupGroupInitialValuesFromSignup(
        fakeSignup({
          city: null,
          contact_person: {
            email: null,
            first_name: null,
            id: null as any,
            last_name: null,
            membership_number: null,
            native_language: null,
            notifications: NOTIFICATION_TYPE.EMAIL,
            phone_number: null,
            service_language: null,
          },
          date_of_birth: null,
          extra_info: null,
          first_name: null,
          id: TEST_SIGNUP_ID,
          last_name: null,
          phone_number: null,
          price_group: null,
          street_address: null,
          zipcode: null,
        })
      )
    ).toEqual({
      contactPerson: {
        email: '',
        firstName: '',
        id: null,
        lastName: '',
        membershipNumber: '',
        nativeLanguage: '',
        notifications: ['email'],
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
          id: 'signup:1',
          inWaitingList: false,
          lastName: '',
          phoneNumber: '',
          priceGroup: '',
          streetAddress: '',
          zipcode: '',
        },
      ],
      userConsent: false,
    });
  });

  it('should return signup group initial values', () => {
    const expectedCity = 'City';
    const expectedContactPersonFirstName = 'Contact first name';
    const expectedContactPersonLastName = 'Contact last name';
    const expectedDateOfBirth = '10.10.2021';
    const expectedEmail = 'user@email.com';
    const expectedExtraInfo = 'Extra info';
    const expectedFirstName = 'First name';
    const expectedLastName = 'Last name';
    const expectedMembershipNumber = 'XXX-XXX-XXX';
    const expectedNativeLanguage = 'fi';
    const expectedNotifications = [NOTIFICATIONS.EMAIL];
    const expectedPhoneNumber = '+358 44 123 4567';
    const expectedPriceGroup = '1';
    const expectedServiceLanguage = 'sv';
    const expectedStreetAddress = 'Test address';
    const expectedUserConsent = true;
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
      userConsent,
    } = getSignupGroupInitialValuesFromSignup(
      fakeSignup({
        city: expectedCity,
        contact_person: {
          email: expectedEmail,
          first_name: expectedContactPersonFirstName,
          id: TEST_SIGNUP_ID,
          last_name: expectedContactPersonLastName,
          membership_number: expectedMembershipNumber,
          native_language: expectedNativeLanguage,
          notifications: NOTIFICATION_TYPE.EMAIL,
          phone_number: expectedPhoneNumber,
          service_language: expectedServiceLanguage,
        },
        date_of_birth: '2021-10-10',
        extra_info: expectedExtraInfo,
        first_name: expectedFirstName,
        id: TEST_SIGNUP_ID,
        last_name: expectedLastName,
        phone_number: expectedPhoneNumber,
        price_group: fakeSignupPriceGroup({ registration_price_group: 1 }),
        street_address: expectedStreetAddress,
        user_consent: expectedUserConsent,
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
        phoneNumber: expectedPhoneNumber,
        priceGroup: expectedPriceGroup,
        streetAddress: expectedStreetAddress,
        zipcode: expectedZip,
      },
    ]);
    expect(email).toBe(expectedEmail);
    expect(contactPersonFirstName).toBe(expectedContactPersonFirstName);
    expect(contactPersonLastName).toBe(expectedContactPersonLastName);
    expect(extraInfo).toBe('');
    expect(membershipNumber).toBe(expectedMembershipNumber);
    expect(nativeLanguage).toBe(expectedNativeLanguage);
    expect(notifications).toEqual(expectedNotifications);
    expect(phoneNumber).toBe(expectedPhoneNumber);
    expect(serviceLanguage).toBe(expectedServiceLanguage);
    expect(userConsent).toBe(expectedUserConsent);
  });
});

describe('getUpdateSignupPayload function', () => {
  it('should return payload to update a signup', () => {
    expect(
      getUpdateSignupPayload({
        formValues: SIGNUP_GROUP_INITIAL_VALUES,
        hasSignupGroup: false,
        id: TEST_SIGNUP_ID,
        registration,
      })
    ).toEqual({
      city: '',
      contact_person: {
        email: null,
        id: null,
        first_name: '',
        last_name: '',
        membership_number: '',
        native_language: null,
        notifications: NOTIFICATION_TYPE.EMAIL,
        phone_number: null,
        service_language: null,
      },
      date_of_birth: null,
      extra_info: '',
      first_name: '',
      id: TEST_SIGNUP_ID,
      last_name: '',
      phone_number: '',
      registration: registration.id,
      street_address: null,
      user_consent: false,
      zipcode: null,
    });
  });

  it('contact_person should be null if hasSignupGroup is true', () => {
    const { contact_person } = getUpdateSignupPayload({
      formValues: SIGNUP_GROUP_INITIAL_VALUES,
      hasSignupGroup: true,
      id: TEST_SIGNUP_ID,
      registration,
    });
    expect(contact_person).toBe(undefined);
  });

  it('should return update signup payload', () => {
    const city = 'City',
      contactPersonFirstName = 'Contact first name',
      contactPersonLastName = 'Contact first name',
      dateOfBirth = '10.10.1999',
      email = 'Email',
      extraInfo = 'Extra info',
      firstName = 'First name',
      lastName = 'Last name',
      membershipNumber = 'XXX-123',
      nativeLanguage = 'fi',
      notifications = [NOTIFICATIONS.EMAIL],
      phoneNumber = '0441234567',
      priceGroup = '1',
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
        phoneNumber,
        priceGroup,
        streetAddress,
        zipcode,
      },
    ];
    const payload = getUpdateSignupPayload({
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
        extraInfo: '',
        signups,
      },
      hasSignupGroup: false,
      id: TEST_SIGNUP_ID,
      registration,
    });

    expect(payload).toEqual({
      city,
      contact_person: {
        email,
        first_name: contactPersonFirstName,
        id: TEST_CONTACT_PERSON_ID,
        last_name: contactPersonLastName,
        membership_number: membershipNumber,
        native_language: nativeLanguage,
        notifications: NOTIFICATION_TYPE.EMAIL,
        phone_number: phoneNumber,
        service_language: serviceLanguage,
      },
      date_of_birth: '1999-10-10',
      extra_info: extraInfo,
      first_name: firstName,
      id: TEST_SIGNUP_ID,
      last_name: lastName,
      phone_number: phoneNumber,
      price_group: { registration_price_group: 1 },
      registration: registration.id,
      street_address: streetAddress,
      user_consent: false,
      zipcode,
    });
  });
});

describe('omitSensitiveDataFromSignupPayload', () => {
  const signupPayload: SignupInput = {
    city: 'Helsinki',
    date_of_birth: '1999-10-10',
    contact_person: {
      email: 'test@email.com',
      first_name: 'First name',
      id: TEST_CONTACT_PERSON_ID,
      last_name: 'Last name',
      membership_number: 'XYZ',
      native_language: 'fi',
      notifications: NOTIFICATION_TYPE.EMAIL,
      phone_number: '0441234567',
      service_language: 'fi',
    },
    extra_info: 'Signup entra info',
    first_name: 'First name',
    id: '1',
    last_name: 'Last name',
    phone_number: '0441234567',
    street_address: 'Address',
    user_consent: true,
    zipcode: '123456',
  };
  it('should omit sensitive data from payload', () => {
    const filteredPayload = omitSensitiveDataFromSignupPayload(
      signupPayload
    ) as SignupInput;
    expect(filteredPayload).toEqual({
      contact_person: {
        id: TEST_CONTACT_PERSON_ID,
        notifications: NOTIFICATION_TYPE.EMAIL,
      },
      id: '1',
      user_consent: true,
    });
    expect(filteredPayload.city).toBeUndefined();
    expect(filteredPayload.extra_info).toBeUndefined();
    expect(filteredPayload.extra_info).toBeUndefined();
    expect(filteredPayload.first_name).toBeUndefined();
    expect(filteredPayload.last_name).toBeUndefined();
    expect(filteredPayload.street_address).toBeUndefined();
    expect(filteredPayload.zipcode).toBeUndefined();
    expect(filteredPayload.street_address).toBeUndefined();
    expect(filteredPayload.zipcode).toBeUndefined();
  });

  it('contact person should be undefined if its not defined', () => {
    const payload: SignupInput = {
      ...signupPayload,
      contact_person: undefined,
    };

    const { contact_person } = omitSensitiveDataFromSignupPayload(payload);
    expect(contact_person).toBe(undefined);
  });
});
