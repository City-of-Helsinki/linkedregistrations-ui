import { advanceTo, clear } from 'jest-date-mock';
import * as Yup from 'yup';

import { VALIDATION_MESSAGE_KEYS } from '../../../constants';
import {
  fakeEvent,
  fakeRegistration,
  fakeRegistrationPriceGroup,
} from '../../../utils/mockDataUtils';
import { mockNumberString, mockString } from '../../../utils/testUtils';
import { stringOrNull } from '../../api/types';
import { REGISTRATION_MANDATORY_FIELDS } from '../../registration/constants';
import { Registration } from '../../registration/types';
import { NOTIFICATIONS } from '../constants';
import {
  ContactPersonFormFields,
  SignupFormFields,
  SignupGroupFormFields,
} from '../types';
import {
  getContactPersonSchema,
  getSignupGroupSchema,
  getSignupSchema,
  isAboveMinAge,
  isBelowMaxAge,
} from '../validation';

afterEach(() => {
  clear();
});

const validSignup: SignupFormFields = {
  city: 'City',
  dateOfBirth: '1.1.2000',
  extraInfo: '',
  firstName: 'first name',
  id: null,
  inWaitingList: true,
  lastName: 'last name',
  phoneNumber: '0441234567',
  priceGroup: '',
  streetAddress: 'Street address',
  zipcode: '00100',
};

const validContactPerson: ContactPersonFormFields = {
  email: 'user@email.com',
  firstName: 'First name',
  id: null,
  lastName: 'First name',
  membershipNumber: '',
  nativeLanguage: 'fi',
  notifications: [NOTIFICATIONS.EMAIL],
  phoneNumber: '',
  serviceLanguage: 'fi',
};

const testAboveMinAge = async (
  minAge: number,
  date: string,
  startTime: stringOrNull = null
) => {
  try {
    await Yup.string()
      .test(
        'isAboveMinAge',
        () => ({
          key: VALIDATION_MESSAGE_KEYS.AGE_MIN,
          min: minAge,
        }),
        (date) => isAboveMinAge(date, startTime, minAge)
      )
      .validate(date);
    return true;
  } catch (e) {
    return false;
  }
};

const testBelowMaxAge = async (
  maxAge: number,
  date: string,
  startTime: stringOrNull = null
) => {
  try {
    await Yup.string()
      .test(
        'isBelowMaxAge',
        () => ({
          key: VALIDATION_MESSAGE_KEYS.AGE_MAX,
          max: maxAge,
        }),
        (date) => isBelowMaxAge(date, startTime, maxAge)
      )
      .validate(date);
    return true;
  } catch (e) {
    return false;
  }
};

const testSignupSchema = async (
  registration: Registration,
  signup: SignupFormFields
) => {
  try {
    await getSignupSchema(registration).validate(signup);
    return true;
  } catch (e) {
    return false;
  }
};

const testContactPersonSchema = async (
  registration: Registration,
  signups: SignupFormFields[],
  contactPerson: ContactPersonFormFields
) => {
  try {
    await getContactPersonSchema(registration, signups).validate(contactPerson);
    return true;
  } catch (e) {
    return false;
  }
};

const testSignupGroupSchema = async (
  registration: Registration,
  signupGroup: SignupGroupFormFields
) => {
  try {
    await getSignupGroupSchema(registration).validate(signupGroup);
    return true;
  } catch (e) {
    return false;
  }
};

describe('isAboveMinAge function', () => {
  test('should return true if value is empty', async () => {
    advanceTo('2022-10-10');

    const result = await testAboveMinAge(9, '');

    expect(result).toBe(true);
  });

  test('should return false if age is less than min age', async () => {
    advanceTo('2022-10-10');

    const result = await testAboveMinAge(9, '1.1.2022');

    expect(result).toBe(false);
  });

  test('should return false if age is less than min age in start time', async () => {
    advanceTo('2022-10-10');

    const result = await testAboveMinAge(9, '1.1.2022', '2022-12-12');

    expect(result).toBe(false);
  });

  test('should return true if age is greater than min age', async () => {
    advanceTo('2022-10-10');

    const result = await testAboveMinAge(9, '1.1.2012');

    expect(result).toBe(true);
  });

  test('should return true if age is greater than min age in start time', async () => {
    advanceTo('2022-10-10');

    const result = await testAboveMinAge(9, '11.12.2012', '2022-12-12');

    expect(result).toBe(true);
  });
});

describe('isBelowMaxAge function', () => {
  test('should return true if value is empty', async () => {
    advanceTo('2022-10-10');

    const result = await testBelowMaxAge(9, '');

    expect(result).toBe(true);
  });

  test('should return false if age is greater than max age', async () => {
    advanceTo('2022-10-10');

    const result = await testBelowMaxAge(9, '1.1.2012');

    expect(result).toBe(false);
  });

  test('should return true if age is less than max age', async () => {
    advanceTo('2022-10-10');

    const result = await testBelowMaxAge(9, '1.1.2015');

    expect(result).toBe(true);
  });

  test('should return false if age is greater than max age in start time', async () => {
    advanceTo('2022-10-10');

    const result = await testBelowMaxAge(9, '1.1.2015', '2025-10-10');

    expect(result).toBe(false);
  });
});

describe('signupSchema function', () => {
  const registration = fakeRegistration({
    event: fakeEvent({ start_time: null }),
    registration_price_groups: [fakeRegistrationPriceGroup({ id: 1 })],
  });
  const validSignup: SignupFormFields = {
    city: 'City',
    dateOfBirth: '1.1.2000',
    extraInfo: '',
    firstName: 'first name',
    id: null,
    inWaitingList: true,
    lastName: 'last name',
    phoneNumber: '0441234567',
    priceGroup: '1',
    streetAddress: 'Street address',
    zipcode: '00100',
  };

  test('should return true if signup is valid', async () => {
    expect(await testSignupSchema(registration, validSignup)).toBe(true);
  });

  const testCases: [Partial<SignupFormFields>][] = [
    [{ city: '' }],
    [{ city: mockString(51) }],
    [{ firstName: '' }],
    [{ firstName: mockString(51) }],
    [{ lastName: '' }],
    [{ lastName: mockString(51) }],
    [{ phoneNumber: '' }],
    [{ phoneNumber: 'xxx' }],
    [{ phoneNumber: mockNumberString(19) }],
    [{ streetAddress: '' }],
    [{ streetAddress: mockString(501) }],
    [{ zipcode: '' }],
    [{ zipcode: '123456' }],
    [{ zipcode: mockString(11) }],
  ];

  it.each(testCases)(
    'should return false if signup is invalid, %s',
    async (signupOverrides) => {
      expect(
        await testSignupSchema(
          fakeRegistration({
            mandatory_fields: [
              REGISTRATION_MANDATORY_FIELDS.CITY,
              REGISTRATION_MANDATORY_FIELDS.FIRST_NAME,
              REGISTRATION_MANDATORY_FIELDS.LAST_NAME,
              REGISTRATION_MANDATORY_FIELDS.PHONE_NUMBER,
              REGISTRATION_MANDATORY_FIELDS.STREET_ADDRESS,
              REGISTRATION_MANDATORY_FIELDS.ZIPCODE,
            ],
          }),
          {
            ...validSignup,
            ...signupOverrides,
          }
        )
      ).toBe(false);
    }
  );

  test('should return false if price group is missing', async () => {
    expect(
      await testSignupSchema(registration, { ...validSignup, priceGroup: '' })
    ).toBe(false);
  });

  test("should return false if price group is missing but registration doesn't have any price group", async () => {
    expect(
      await testSignupSchema(
        fakeRegistration({ registration_price_groups: [] }),
        { ...validSignup, priceGroup: '' }
      )
    ).toBe(true);
  });

  test('should return false if date of birth is missing', async () => {
    expect(
      await testSignupSchema(fakeRegistration({ audience_min_age: 8 }), {
        ...validSignup,
        dateOfBirth: '',
      })
    ).toBe(false);

    expect(
      await testSignupSchema(fakeRegistration({ audience_max_age: 12 }), {
        ...validSignup,
        dateOfBirth: '',
      })
    ).toBe(false);
  });

  test('should return false if age is greater than max age', async () => {
    advanceTo('2022-10-10');

    expect(
      await testSignupSchema(
        fakeRegistration({
          audience_max_age: 8,
          event: fakeEvent({ start_time: null }),
        }),
        {
          ...validSignup,
          dateOfBirth: '1.1.2012',
        }
      )
    ).toBe(false);
  });

  test('should return false if age is less than min age', async () => {
    advanceTo('2022-10-10');

    expect(
      await testSignupSchema(
        fakeRegistration({
          audience_min_age: 5,
          event: fakeEvent({ start_time: null }),
        }),
        {
          ...validSignup,
          dateOfBirth: '1.1.2022',
        }
      )
    ).toBe(false);
  });

  test('should return false if date of birth is in invalid format', async () => {
    advanceTo('2022-10-10');

    expect(
      await testSignupSchema(
        fakeRegistration({
          audience_min_age: 10,
        }),
        {
          ...validSignup,
          dateOfBirth: '1.1.202',
        }
      )
    ).toBe(false);
  });
});

describe('getContactPersonSchema function', () => {
  const registration = fakeRegistration();
  const signups: SignupFormFields[] = [];

  test('should return true if contact person data is valid', async () => {
    expect(
      await testContactPersonSchema(registration, signups, validContactPerson)
    ).toBe(true);
  });

  const testCases: [Partial<ContactPersonFormFields>][] = [
    [{ email: '' }],
    [{ email: `${mockString(255)}@email.com` }],
    [{ email: 'not-email' }],
    [{ phoneNumber: '', notifications: [NOTIFICATIONS.SMS] }],
    [{ phoneNumber: 'xxx', notifications: [NOTIFICATIONS.SMS] }],
    [{ phoneNumber: mockNumberString(19), notifications: [NOTIFICATIONS.SMS] }],
    [{ firstName: mockString(51) }],
    [{ lastName: mockString(51) }],
    [{ notifications: [] }],
    [{ membershipNumber: mockString(51) }],
    [{ serviceLanguage: '' }],
  ];

  it.each(testCases)(
    'should return false if contact person is invalid, %s',
    async (contactPersonOverrides) => {
      expect(
        await testContactPersonSchema(registration, signups, {
          ...validContactPerson,
          ...contactPersonOverrides,
        })
      ).toBe(false);
    }
  );

  test('should return true if signup is free and first name is empty', async () => {
    const registration = fakeRegistration({
      registration_price_groups: [
        fakeRegistrationPriceGroup({ id: 1, price: '0.00' }),
      ],
    });
    const signups: SignupFormFields[] = [{ ...validSignup, priceGroup: '1' }];
    expect(
      await testContactPersonSchema(registration, signups, {
        ...validContactPerson,
        firstName: '',
      })
    ).toBe(true);
  });

  test('should return false if payment is required and first name is empty', async () => {
    const registration = fakeRegistration({
      registration_price_groups: [
        fakeRegistrationPriceGroup({ id: 1, price: '12.00' }),
      ],
    });
    const signups: SignupFormFields[] = [{ ...validSignup, priceGroup: '1' }];
    expect(
      await testContactPersonSchema(registration, signups, {
        ...validContactPerson,
        firstName: '',
      })
    ).toBe(false);
  });

  test('should return true if signup is free and last name is empty', async () => {
    const registration = fakeRegistration({
      registration_price_groups: [
        fakeRegistrationPriceGroup({ id: 1, price: '0.00' }),
      ],
    });
    const signups: SignupFormFields[] = [{ ...validSignup, priceGroup: '1' }];
    expect(
      await testContactPersonSchema(registration, signups, {
        ...validContactPerson,
        lastName: '',
      })
    ).toBe(true);
  });

  test('should return false if payment is required and last name is empty', async () => {
    const registration = fakeRegistration({
      registration_price_groups: [
        fakeRegistrationPriceGroup({ id: 1, price: '12.00' }),
      ],
    });
    const signups: SignupFormFields[] = [{ ...validSignup, priceGroup: '1' }];
    expect(
      await testContactPersonSchema(registration, signups, {
        ...validContactPerson,
        lastName: '',
      })
    ).toBe(false);
  });
});

describe('testSignupGroupSchema function', () => {
  const registration = fakeRegistration();
  const validSignupGroup: SignupGroupFormFields = {
    contactPerson: {
      email: 'user@email.com',
      firstName: 'First name',
      id: null,
      lastName: 'First name',
      membershipNumber: '',
      nativeLanguage: 'fi',
      notifications: [NOTIFICATIONS.EMAIL],
      phoneNumber: '',
      serviceLanguage: 'fi',
    },
    extraInfo: '',
    signups: [],
    userConsent: true,
  };

  test('should return true if signup group data is valid', async () => {
    expect(await testSignupGroupSchema(registration, validSignupGroup)).toBe(
      true
    );
  });

  test('should return false if email is missing', async () => {
    expect(
      await testSignupGroupSchema(registration, {
        ...validSignupGroup,
        contactPerson: { ...validSignupGroup.contactPerson, email: '' },
      })
    ).toBe(false);
  });

  test('should return false if email is invalid', async () => {
    expect(
      await testSignupGroupSchema(registration, {
        ...validSignupGroup,
        contactPerson: {
          ...validSignupGroup.contactPerson,
          email: 'user@email.',
        },
      })
    ).toBe(false);
  });

  test('should return false if phone number is missing', async () => {
    expect(
      await testSignupGroupSchema(registration, {
        ...validSignupGroup,
        contactPerson: {
          ...validSignupGroup.contactPerson,
          phoneNumber: '',
          notifications: [NOTIFICATIONS.SMS],
        },
      })
    ).toBe(false);
  });

  test('should return false if phone number is invalid', async () => {
    expect(
      await testSignupGroupSchema(registration, {
        ...validSignupGroup,
        contactPerson: {
          ...validSignupGroup.contactPerson,
          phoneNumber: 'xxx',
          notifications: [NOTIFICATIONS.SMS],
        },
      })
    ).toBe(false);
  });

  test('should return false if notifications is empty array', async () => {
    expect(
      await testSignupGroupSchema(registration, {
        ...validSignupGroup,
        contactPerson: { ...validSignupGroup.contactPerson, notifications: [] },
      })
    ).toBe(false);
  });

  test('should return false if service language is empty', async () => {
    expect(
      await testSignupGroupSchema(registration, {
        ...validSignupGroup,
        contactPerson: {
          ...validSignupGroup.contactPerson,
          serviceLanguage: '',
        },
      })
    ).toBe(false);
  });
});
