import {
  fakeContactPerson,
  fakeRegistration,
  fakeRegistrationPriceGroup,
  fakeSignup,
  fakeSignupGroup,
  fakeSignupPriceGroup,
} from '../../../utils/mockDataUtils';
import { registration } from '../../registration/__mocks__/registration';
import {
  REGISTRATION_MANDATORY_FIELDS,
  TEST_REGISTRATION_ID,
} from '../../registration/constants';
import {
  ATTENDEE_STATUS,
  NOTIFICATION_TYPE,
  TEST_CONTACT_PERSON_ID,
  TEST_SIGNUP_ID,
} from '../../signup/constants';
import { ContactPersonInput, SignupInput } from '../../signup/types';
import { getSignupInitialValues } from '../../signup/utils';
import {
  CONTACT_PERSON_FIELDS,
  NOTIFICATIONS,
  SIGNUP_GROUP_FIELDS,
  SIGNUP_GROUP_INITIAL_VALUES,
  SIGNUP_INITIAL_VALUES,
  TEST_REGISTRATION_PRICE_GROUP_ID,
  TEST_SIGNUP_GROUP_ID,
} from '../constants';
import {
  CreateSignupGroupMutationInput,
  SignupFormFields,
  SignupGroup,
  SignupGroupQueryVariables,
  SignupPriceGroupOption,
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
  calculateTotalPrice,
  shouldCreatePayment,
  canEditSignupGroup,
} from '../utils';

describe('canEditSignupGroup function', () => {
  const cases: [SignupGroup, boolean][] = [
    [
      fakeSignupGroup({
        has_contact_person_access: false,
        is_created_by_current_user: false,
      }),
      false,
    ],
    [
      fakeSignupGroup({
        has_contact_person_access: true,
        is_created_by_current_user: false,
      }),
      true,
    ],
    [
      fakeSignupGroup({
        has_contact_person_access: false,
        is_created_by_current_user: true,
      }),
      true,
    ],
    [
      fakeSignupGroup({
        has_contact_person_access: true,
        is_created_by_current_user: true,
      }),
      true,
    ],
  ];

  it.each(cases)(
    'should return true if signup group can be edited',
    (signupGroup, expectedResult) =>
      expect(canEditSignupGroup(signupGroup)).toBe(expectedResult)
  );
});

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
      contact_person: {
        email: null,
        first_name: '',
        id: null,
        last_name: '',
        membership_number: '',
        native_language: null,
        notifications: NOTIFICATION_TYPE.EMAIL,
        phone_number: null,
        service_language: null,
      },
      extra_info: '',
      registration: registration.id,
      reservation_code: 'code',
      signups: [
        {
          city: '',
          date_of_birth: null,
          extra_info: '',
          first_name: '',
          last_name: '',
          phone_number: '',
          street_address: null,
          zipcode: null,
          user_consent: false,
        },
      ],
    });

    const city = 'City',
      contactPersonFirstName = 'Contact first name',
      contactPersonLastName = 'Contact lirst name',
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
      priceGroup = '1',
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
            phoneNumber,
            priceGroup,
            streetAddress,
            zipcode,
          },
        ],

        extraInfo: groupExtraInfo,
        userConsent,
      },
      registration: fakeRegistration({
        id: TEST_REGISTRATION_ID,
        registration_price_groups: [
          fakeRegistrationPriceGroup({
            price: '10.00',
            id: TEST_REGISTRATION_PRICE_GROUP_ID,
          }),
        ],
      }),
      reservationCode,
    });

    expect(payload).toEqual({
      contact_person: {
        email,
        first_name: contactPersonFirstName,
        id: null,
        last_name: contactPersonLastName,
        membership_number: membershipNumber,
        native_language: nativeLanguage,
        notifications: NOTIFICATION_TYPE.EMAIL,
        phone_number: phoneNumber,
        service_language: serviceLanguage,
      },
      create_payment: true,
      extra_info: groupExtraInfo,
      registration: registration.id,
      reservation_code: reservationCode,
      signups: [
        {
          city,
          date_of_birth: '1999-10-10',
          extra_info: extraInfo,
          first_name: firstName,
          id: TEST_SIGNUP_ID,
          last_name: lastName,
          phone_number: phoneNumber,
          price_group: { registration_price_group: 1 },
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
      phoneNumber: '',
      priceGroup: '',
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
          phoneNumber: '',
          priceGroup: '',
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
            phone_number: null,
            price_group: null,
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
        phoneNumber: '',
        priceGroup: '',
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
    const expectedPriceGroup = '1';
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
            phone_number: expectedPhoneNumber,
            price_group: fakeSignupPriceGroup({ registration_price_group: 1 }),
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
        phoneNumber: expectedPhoneNumber,
        priceGroup: expectedPriceGroup,
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
    [
      { id: 'signupGroup:1', accessCode: 'access-code' },
      '/signup_group/signupGroup:1/?access_code=access-code',
    ],
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
      contact_person: {
        email: null,
        first_name: '',
        id: null,
        last_name: '',
        membership_number: '',
        native_language: null,
        notifications: NOTIFICATION_TYPE.EMAIL,
        phone_number: null,
        service_language: null,
      },
      extra_info: '',
      id: TEST_SIGNUP_GROUP_ID,
      registration: TEST_REGISTRATION_ID,
      signups: [
        {
          city: '',
          date_of_birth: null,
          extra_info: '',
          first_name: '',
          last_name: '',
          phone_number: '',
          street_address: null,
          zipcode: null,
          user_consent: false,
        },
      ],
    });
  });

  it('should return signup group payload', () => {
    const city = 'City',
      contactPersonFirstName = 'Contact first name',
      contactPersonLastName = 'Contact last name',
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
      priceGroup = '1',
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
        phoneNumber,
        priceGroup,
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
      extra_info: groupExtraInfo,
      id: TEST_SIGNUP_GROUP_ID,
      registration: TEST_REGISTRATION_ID,
      signups: [
        {
          city,
          date_of_birth: '1999-10-10',
          extra_info: extraInfo,
          first_name: firstName,
          id: TEST_SIGNUP_ID,
          last_name: lastName,
          phone_number: phoneNumber,
          price_group: { registration_price_group: 1 },
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
      extra_info: 'Extra info',
      registration: registration.id,
      reservation_code: 'xxx',
      signups: [
        {
          city: 'Helsinki',
          contact_person: undefined,
          date_of_birth: '1999-10-10',
          extra_info: 'Signup entra info',
          first_name: 'First name',
          id: '1',
          last_name: 'Last name',
          phone_number: '0441234567',
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
      contact_person: {
        id: TEST_CONTACT_PERSON_ID,
        notifications: NOTIFICATION_TYPE.EMAIL,
      },
      registration: registration.id,
      reservation_code: 'xxx',
      signups: [
        {
          id: '1',
          contact_person: undefined,
          user_consent: true,
        },
      ],
    });
    const signup = filteredPayload.signups?.[0] as SignupInput;
    const contactPerson = filteredPayload.contact_person as ContactPersonInput;
    expect(filteredPayload.extra_info).toBeUndefined();
    expect(contactPerson.email).toBeUndefined();
    expect(contactPerson.first_name).toBeUndefined();
    expect(contactPerson.last_name).toBeUndefined();
    expect(contactPerson.membership_number).toBeUndefined();
    expect(contactPerson.native_language).toBeUndefined();
    expect(contactPerson.phone_number).toBeUndefined();
    expect(contactPerson.service_language).toBeUndefined();
    expect(signup.city).toBeUndefined();
    expect(signup.extra_info).toBeUndefined();
    expect(signup.first_name).toBeUndefined();
    expect(signup.last_name).toBeUndefined();
    expect(signup.street_address).toBeUndefined();
    expect(signup.zipcode).toBeUndefined();
  });
});

describe('calculateTotalPrice', () => {
  it('should calculate correct total price', () => {
    const priceGroupOptions: SignupPriceGroupOption[] = [
      { label: 'Price 1', value: '1', price: 12.0 },
      { label: 'Price 2', value: '2', price: 8.0 },
      { label: 'Price 3', value: '3', price: 15.0 },
      { label: 'Price 4', value: '4', price: 0 },
    ];
    const signups: SignupFormFields[] = [
      getSignupInitialValues(
        fakeSignup({
          price_group: fakeSignupPriceGroup({ registration_price_group: 1 }),
        })
      ),
      getSignupInitialValues(
        fakeSignup({
          price_group: fakeSignupPriceGroup({ registration_price_group: 2 }),
        })
      ),
      getSignupInitialValues(
        fakeSignup({
          price_group: fakeSignupPriceGroup({ registration_price_group: 3 }),
        })
      ),
      getSignupInitialValues(
        fakeSignup({
          price_group: fakeSignupPriceGroup({ registration_price_group: 4 }),
        })
      ),
    ];

    const totalPrice = calculateTotalPrice(priceGroupOptions, signups);
    expect(totalPrice).toEqual(35);
  });
});

describe('shouldCreatePayment', () => {
  const priceGroupOptions: SignupPriceGroupOption[] = [
    { label: 'Price 1', value: '1', price: 12.0 },
    { label: 'Price 2', value: '2', price: 0 },
  ];
  const chargeableSignup = getSignupInitialValues(
    fakeSignup({
      attendee_status: ATTENDEE_STATUS.Attending,
      price_group: fakeSignupPriceGroup({ registration_price_group: 1 }),
    })
  );
  const chargeableSignupInWaitingList = getSignupInitialValues(
    fakeSignup({
      attendee_status: ATTENDEE_STATUS.Waitlisted,
      price_group: fakeSignupPriceGroup({ registration_price_group: 1 }),
    })
  );
  const freeSignup = getSignupInitialValues(
    fakeSignup({
      attendee_status: ATTENDEE_STATUS.Attending,
      price_group: fakeSignupPriceGroup({ registration_price_group: 2 }),
    })
  );
  const freeSignupInWaitingList = getSignupInitialValues(
    fakeSignup({
      attendee_status: ATTENDEE_STATUS.Waitlisted,
      price_group: fakeSignupPriceGroup({ registration_price_group: 2 }),
    })
  );

  it.each([
    [[chargeableSignup], true],
    [[chargeableSignupInWaitingList], false],
    [[freeSignup], false],
    [[freeSignupInWaitingList], false],
    [[chargeableSignup, chargeableSignup], true],
    [[chargeableSignup, chargeableSignupInWaitingList], true],
    [[chargeableSignup, freeSignup], true],
    [[chargeableSignup, freeSignupInWaitingList], true],
    [[chargeableSignupInWaitingList, freeSignup], false],
    [[chargeableSignupInWaitingList, freeSignupInWaitingList], false],
    [[freeSignup, freeSignupInWaitingList], false],
  ])(
    'should return true if any chargeable signup is attending',
    (signups, createPayment) => {
      expect(shouldCreatePayment(priceGroupOptions, signups)).toEqual(
        createPayment
      );
    }
  );
});
