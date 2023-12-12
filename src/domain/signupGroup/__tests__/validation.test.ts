import { advanceTo, clear } from 'jest-date-mock';
import snakeCase from 'lodash/snakeCase';
import * as Yup from 'yup';

import { VALIDATION_MESSAGE_KEYS } from '../../../constants';
import { fakeRegistration } from '../../../utils/mockDataUtils';
import { REGISTRATION_MANDATORY_FIELDS } from '../../registration/constants';
import { Registration } from '../../registration/types';
import { CONTACT_PERSON_FIELDS, NOTIFICATIONS } from '../constants';
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

const testAboveMinAge = async (minAge: number, date: string) => {
  try {
    await Yup.string()
      .test(
        'isAboveMinAge',
        () => ({
          key: VALIDATION_MESSAGE_KEYS.AGE_MIN,
          min: minAge,
        }),
        (date) => isAboveMinAge(date, minAge)
      )
      .validate(date);
    return true;
  } catch (e) {
    return false;
  }
};

const testBelowMaxAge = async (maxAge: number, date: string) => {
  try {
    await Yup.string()
      .test(
        'isBelowMaxAge',
        () => ({
          key: VALIDATION_MESSAGE_KEYS.AGE_MAX,
          max: maxAge,
        }),
        (date) => isBelowMaxAge(date, maxAge)
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
  contactPerson: ContactPersonFormFields
) => {
  try {
    await getContactPersonSchema(registration).validate(contactPerson);
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
  test('should return true value is null', async () => {
    advanceTo('2022-10-10');

    const result = await testAboveMinAge(9, '');

    expect(result).toBe(true);
  });

  test('should return false if age is less than min age', async () => {
    advanceTo('2022-10-10');

    const result = await testAboveMinAge(9, '1.1.2022');

    expect(result).toBe(false);
  });

  test('should return true if age is greater than min age', async () => {
    advanceTo('2022-10-10');

    const result = await testAboveMinAge(9, '1.1.2012');

    expect(result).toBe(true);
  });
});

describe('isBelowMaxAge function', () => {
  test('should return true if value is null', async () => {
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
});

describe('signupSchema function', () => {
  const registration = fakeRegistration();
  const validSignup: SignupFormFields = {
    city: 'City',
    dateOfBirth: '1.1.2000',
    extraInfo: '',
    firstName: 'first name',
    id: null,
    inWaitingList: true,
    lastName: 'last name',
    streetAddress: 'Street address',
    zipcode: '00100',
  };

  test('should return true if signup is valid', async () => {
    expect(await testSignupSchema(registration, validSignup)).toBe(true);
  });

  test('should return false if first name is missing', async () => {
    expect(
      await testSignupSchema(
        fakeRegistration({
          mandatory_fields: [REGISTRATION_MANDATORY_FIELDS.FIRST_NAME],
        }),
        { ...validSignup, firstName: '' }
      )
    ).toBe(false);
  });

  test('should return false if last name is missing', async () => {
    expect(
      await testSignupSchema(
        fakeRegistration({
          mandatory_fields: [REGISTRATION_MANDATORY_FIELDS.LAST_NAME],
        }),
        { ...validSignup, lastName: '' }
      )
    ).toBe(false);
  });

  test('should return false if street address is missing', async () => {
    expect(
      await testSignupSchema(
        fakeRegistration({
          mandatory_fields: [REGISTRATION_MANDATORY_FIELDS.STREET_ADDRESS],
        }),
        { ...validSignup, streetAddress: '' }
      )
    ).toBe(false);
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
      await testSignupSchema(fakeRegistration({ audience_max_age: 8 }), {
        ...validSignup,
        dateOfBirth: '1.1.2012',
      })
    ).toBe(false);
  });

  test('should return false if age is less than min age', async () => {
    advanceTo('2022-10-10');

    expect(
      await testSignupSchema(fakeRegistration({ audience_min_age: 5 }), {
        ...validSignup,
        dateOfBirth: '1.1.2022',
      })
    ).toBe(false);
  });

  test('should return false if date of birth is in invalid format', async () => {
    advanceTo('2022-10-10');

    expect(
      await testSignupSchema(fakeRegistration(), {
        ...validSignup,
        dateOfBirth: '1.1.202',
      })
    ).toBe(false);
  });

  test('should return false if city is missing', async () => {
    expect(
      await testSignupSchema(
        fakeRegistration({
          mandatory_fields: [REGISTRATION_MANDATORY_FIELDS.CITY],
        }),
        { ...validSignup, city: '' }
      )
    ).toBe(false);
  });

  test('should return false if zip is missing', async () => {
    expect(
      await testSignupSchema(
        fakeRegistration({
          mandatory_fields: [REGISTRATION_MANDATORY_FIELDS.ZIPCODE],
        }),
        { ...validSignup, zipcode: '' }
      )
    ).toBe(false);
  });

  test('should return false if zip is invalid', async () => {
    expect(
      await testSignupSchema(registration, {
        ...validSignup,
        zipcode: '123456',
      })
    ).toBe(false);
  });
});

describe('signupGroupSchema function', () => {
  const registration = fakeRegistration();
  const validContactPerson: ContactPersonFormFields = {
    email: 'user@email.com',
    firstName: 'First name',
    id: null,
    lastName: 'Last name',
    membershipNumber: '',
    nativeLanguage: 'fi',
    notifications: [NOTIFICATIONS.EMAIL],
    phoneNumber: '',
    serviceLanguage: 'fi',
  };
  test('should return true if signup group data is valid', async () => {
    expect(
      await testContactPersonSchema(registration, validContactPerson)
    ).toBe(true);
  });

  test('should return false if email is missing', async () => {
    expect(
      await testContactPersonSchema(registration, {
        ...validContactPerson,
        email: '',
      })
    ).toBe(false);
  });

  test('should return false if email is invalid', async () => {
    expect(
      await testContactPersonSchema(registration, {
        ...validContactPerson,
        email: 'user@email.',
      })
    ).toBe(false);
  });

  test('should return false if phone number is missing', async () => {
    expect(
      await testContactPersonSchema(registration, {
        ...validContactPerson,
        phoneNumber: '',
        notifications: [NOTIFICATIONS.SMS],
      })
    ).toBe(false);
  });

  test('should return false if phone number is invalid', async () => {
    expect(
      await testContactPersonSchema(registration, {
        ...validContactPerson,
        phoneNumber: 'xxx',
        notifications: [NOTIFICATIONS.SMS],
      })
    ).toBe(false);
  });

  test('should return false if notifications is empty array', async () => {
    expect(
      await testContactPersonSchema(registration, {
        ...validContactPerson,
        notifications: [],
      })
    ).toBe(false);
  });

  test('should return false if native language is empty', async () => {
    expect(
      await testContactPersonSchema(registration, {
        ...validContactPerson,
        nativeLanguage: '',
      })
    ).toBe(false);
  });

  test('should return false if service language is empty', async () => {
    expect(
      await testContactPersonSchema(registration, {
        ...validContactPerson,
        serviceLanguage: '',
      })
    ).toBe(false);
  });

  const mandatoryCases: [CONTACT_PERSON_FIELDS][] = [
    [CONTACT_PERSON_FIELDS.FIRST_NAME],
    [CONTACT_PERSON_FIELDS.LAST_NAME],
    [CONTACT_PERSON_FIELDS.MEMBERSHIP_NUMBER],
    [CONTACT_PERSON_FIELDS.PHONE_NUMBER],
  ];

  it.each(mandatoryCases)(
    'should return false if mandatory contact person field is missing, with args %p returns %p',
    async (mandatoryField) => {
      expect(
        await testContactPersonSchema(
          {
            ...registration,
            contact_person_mandatory_fields: [snakeCase(mandatoryField)],
          },
          { ...validContactPerson, [mandatoryField]: '' }
        )
      ).toBe(false);
    }
  );
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

  test('should return false if native language is empty', async () => {
    expect(
      await testSignupGroupSchema(registration, {
        ...validSignupGroup,
        contactPerson: {
          ...validSignupGroup.contactPerson,
          nativeLanguage: '',
        },
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
