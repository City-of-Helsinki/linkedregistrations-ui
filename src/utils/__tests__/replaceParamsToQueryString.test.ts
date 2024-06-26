import replaceParamsToQueryString from '../replaceParamsToQueryString';

describe('replaceParamsToQueryString function', () => {
  const testCases: [string, Record<string, unknown>, string][] = [
    ['', { key: ['value1', 'value2'] }, '?key=value1&key=value2'],
    ['?key=value3', { key: ['value1', 'value2'] }, '?key=value1&key=value2'],
    ['', { key: 1 }, '?key=1'],
    ['?key=1', { key: 2 }, '?key=2'],
    ['?key=string1', { key: 'string2' }, '?key=string2'],
    ['?key=1', { key: null }, ''],
    ['?key=1', { key: undefined }, ''],
    [
      '?key1=value1&replaced=value2',
      { replaced: 'replaced1' },
      '?key1=value1&replaced=replaced1',
    ],
  ];
  it.each(testCases)(
    'should replace params in the query string',
    (originalQueryString, params, expectedQueryString) => {
      expect(
        replaceParamsToQueryString(
          originalQueryString,
          params,
          (o: { param; value }) => o.value
        )
      ).toEqual(expectedQueryString);
    }
  );
});
