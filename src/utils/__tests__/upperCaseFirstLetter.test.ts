import upperCaseFirstLetter from '../upperCaseFirstLetter';

const testCases: [string, string][] = [
  ['TEST', 'TEST'],
  ['Test', 'Test'],
  ['tEST', 'TEST'],
  ['test', 'Test'],
];

test.each(testCases)(
  'should transform first letter to upper case',
  (str, expectedResult) => {
    expect(upperCaseFirstLetter(str)).toBe(expectedResult);
  }
);
