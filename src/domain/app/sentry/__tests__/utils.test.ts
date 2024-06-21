import {
  beforeSend,
  beforeSendTransaction,
  cleanSensitiveData,
} from '../utils';

const sensitive = 'sensitive';
const safe = 'safe';

const originalData = {
  a: safe,
  access_code: sensitive,
  accessCode: sensitive,
  city: sensitive,
  date_of_birth: sensitive,
  email: sensitive,
  extra_info: sensitive,
  first_name: sensitive,
  last_name: sensitive,
  membership_number: sensitive,
  native_language: sensitive,
  phone_number: sensitive,
  postal_code: sensitive,
  service_language: sensitive,
  session: sensitive,
  street_address: sensitive,
  user_email: sensitive,
  user_name: sensitive,
  user_phone_number: sensitive,
  zipcode: sensitive,
  arrayOfObjects: [
    { a: safe, accessCode: sensitive },
    { b: safe, accessCode: sensitive },
  ],
  arrayOfStrings: [safe],
  object: { c: safe, userEmail: sensitive, userName: sensitive },
};

const cleanedData = {
  a: safe,
  arrayOfObjects: [{ a: safe }, { b: safe }],
  arrayOfStrings: [safe],
  object: { c: safe },
};

describe('beforeSend', () => {
  it('should clear sensitive data', () => {
    expect(
      beforeSend({ extra: { data: originalData }, type: undefined })
    ).toEqual({ extra: { data: cleanedData } });
  });
});

describe('beforeSendTransaction', () => {
  it('should clear sensitive data', () => {
    expect(
      beforeSendTransaction({
        extra: { data: originalData },
        type: 'transaction',
      })
    ).toEqual({ extra: { data: cleanedData }, type: 'transaction' });
  });
});

describe('cleanSensitiveData', () => {
  it('should clear sensitive data', () => {
    expect(cleanSensitiveData(originalData)).toEqual(cleanedData);
  });
});
