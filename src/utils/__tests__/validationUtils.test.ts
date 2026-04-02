import { TFunction } from 'next-i18next';

import { getErrorText, isValidPhoneNumber } from '../validationUtils';

describe('getErrorText', () => {
  it('should return error text', () => {
    const t = vi.fn() as unknown as TFunction;
    const errorKey = 'errorkey';
    const error = { value: 10, key: errorKey };

    getErrorText(errorKey, true, t);
    expect(t).toBeCalledWith(errorKey);

    getErrorText(error, true, t);
    expect(t).toBeCalledWith(error.key, error);
  });
});

describe('isValidPhoneNumber function', () => {
  const validCases: string[][] = [
    ['0441234567'],
    ['044 1234 567'],
    ['044 123 4567'],
    ['044 1234567'],
    ['+358441234567'],
    ['+358 44 123 4567'],
    ['+358 44 1234 567'],
    ['+358 441234567'],
  ];
  test.each(validCases)(
    'should return true value if phone number is valid, %p',
    async (phoneNumber) => {
      expect(isValidPhoneNumber(phoneNumber)).toBe(true);
    }
  );

  const invalidCases: string[][] = [
    ['044  1234 56x'],
    ['044  123x 567'],
    ['04x  1234 567'],
    ['044  1234 567'],
    ['044 123  4567'],
    ['044  1234567'],
    ['+358  44 123 4567'],
    ['+358 44  123 4567'],
    ['+358 44 1234  567'],
    ['+358  441234567'],
  ];
  test.each(invalidCases)(
    'should return false value if phone number is invalid, %p',
    async (phoneNumber) => {
      expect(isValidPhoneNumber(phoneNumber)).toBe(false);
    }
  );
});
