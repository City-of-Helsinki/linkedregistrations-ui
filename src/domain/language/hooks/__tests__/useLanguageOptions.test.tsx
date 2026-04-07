import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { getQueryWrapper, setQueryMocks } from '../../../../utils/testUtils';
import { mockedLanguagesResponses } from '../../__mocks__/languages';
import useLanguageOptions from '../useLanguageOptions';

test('should return language options', async () => {
  setQueryMocks(...mockedLanguagesResponses);
  const wrapper = getQueryWrapper();

  const { result } = renderHook(() => useLanguageOptions(), { wrapper });

  await waitFor(() => expect(result.current.length).toBeTruthy());

  expect(result.current).toEqual([
    { label: 'Suomi', value: 'fi' },
    { label: 'Ruotsi', value: 'sv' },
    { label: 'Englanti', value: 'en' },
    { label: 'Arabia', value: 'ar' },
    { label: 'Espanja', value: 'es' },
    { label: 'Kiina', value: 'zh_hans' },
    { label: 'Persia', value: 'fa' },
    { label: 'Ranska', value: 'fr' },
    { label: 'Somali', value: 'so' },
    { label: 'Turkki', value: 'tr' },
    { label: 'Venäjä', value: 'ru' },
    { label: 'Viro', value: 'et' },
  ]);
});

test('should return service language options', async () => {
  setQueryMocks(...mockedLanguagesResponses);
  const wrapper = getQueryWrapper();

  const { result } = renderHook(
    () => useLanguageOptions({ serviceLanguage: true }),
    { wrapper }
  );

  await waitFor(() => expect(result.current.length).toBeTruthy());

  expect(result.current).toEqual([
    { label: 'Suomi', value: 'fi' },
    { label: 'Ruotsi', value: 'sv' },
    { label: 'Englanti', value: 'en' },
  ]);
});

test('should return empty array', async () => {
  setQueryMocks(http.get('*/language/', () => HttpResponse.json({})));
  const wrapper = getQueryWrapper();

  const { result } = renderHook(() => useLanguageOptions(), { wrapper });

  expect(result.current).toEqual([]);
});
