import { http, HttpResponse } from 'msw';

import {
  fakeLanguages,
  fakeLocalisedObject,
} from '../../../utils/mockDataUtils';

const languages = [
  {
    id: 'en',
    name: { ...fakeLocalisedObject('englanti') },
  },
  {
    id: 'sv',
    name: { ...fakeLocalisedObject('ruotsi') },
  },
  {
    id: 'fi',
    name: { ...fakeLocalisedObject('suomi') },
  },
  {
    id: 'ru',
    name: { ...fakeLocalisedObject('venäjä') },
  },
  {
    id: 'et',
    name: { ...fakeLocalisedObject('viro') },
  },
  {
    id: 'fr',
    name: { ...fakeLocalisedObject('ranska') },
  },
  {
    id: 'so',
    name: { ...fakeLocalisedObject('somali') },
  },
  {
    id: 'es',
    name: { ...fakeLocalisedObject('espanja') },
  },
  {
    id: 'tr',
    name: { ...fakeLocalisedObject('turkki') },
  },
  {
    id: 'fa',
    name: { ...fakeLocalisedObject('persia') },
  },
  {
    id: 'ar',
    name: { ...fakeLocalisedObject('arabia') },
  },
  {
    id: 'zh_hans',
    name: { ...fakeLocalisedObject('kiina') },
  },
];

const languagesResponse = fakeLanguages(languages.length, languages);

const serviceLanguages = languages.filter((l) =>
  ['en', 'fi', 'sv'].includes(l.id)
);
const serviceLanguagesResponse = fakeLanguages(
  serviceLanguages.length,
  serviceLanguages
);

const mockedLanguagesResponses = [
  http.get('*/language/', ({ request }) => {
    if (new URL(request.url).searchParams.get('service_language')) {
      return HttpResponse.json(serviceLanguagesResponse);
    }
    return HttpResponse.json(languagesResponse);
  }),
];
export {
  languagesResponse,
  mockedLanguagesResponses,
  serviceLanguagesResponse,
};
