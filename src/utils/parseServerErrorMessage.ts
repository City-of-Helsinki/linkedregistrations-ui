// LE returns always error message in a single language, so use i18n to translate

import { TFunction } from 'i18next';

import { LEServerError } from '../types';

// error message to used UI language
const parseServerErrorMessage = ({
  error,
  t,
}: {
  error: LEServerError;
  t: TFunction;
}): string => {
  let errorStr = '';

  if (typeof error === 'string') {
    errorStr = error;
  } else if (Array.isArray(error)) {
    const e =
      typeof error[0] === 'object'
        ? Object.values(error[0]).find((item) => item)
        : error[0];
    errorStr = Array.isArray(e) ? e[0] : e;
  } else {
    const e = Object.values(error).find((item) => item);
    errorStr = Array.isArray(e) ? e[0] : e;
  }

  switch (errorStr) {
    case 'Arvo saa olla enintään 255 merkkiä pitkä.':
      return t(`common:serverError.maxLength255`);
    case 'Arvon tulee olla uniikki.':
      return t(`common:serverError.mustBeUnique`);
    case 'Could not find all objects to update.':
      return t(`common:serverError.notFoundAllObjects`);
    case 'End time cannot be in the past. Please set a future end time.':
      return t(`common:serverError.endTimeInPast`);
    case 'Kenttien email, registration tulee muodostaa uniikki joukko.':
      return t(`common:serverError.emailMustBeUnique`);
    case 'Kenttien phone_number, registration tulee muodostaa uniikki joukko.':
      return t(`common:serverError.phoneNumberMustBeUnique`);
    case 'Not enough seats available.':
      return t(`common:serverError.notEnoughSeats`);
    case 'Price info must be specified before an event is published.':
      return t(`common:serverError.offersIsRequired`);
    case 'Short description length must be 160 characters or less':
      return t(`common:serverError.shortDescriptionTooLong`);
    case 'Syötä oikea URL-osoite.':
      return t(`common:serverError.invalidUrl`);
    case 'The name must be specified.':
      return t(`common:serverError.nameIsRequired`);
    case 'The participant is too old.':
      return t(`common:serverError.participantTooOld`);
    case 'The participant is too young.':
      return t(`common:serverError.participantTooYoung`);
    case 'This field must be specified before an event is published.':
      return t(`common:serverError.requiredWhenPublishing`);
    case 'Tämä kenttä ei voi olla tyhjä.':
      return t(`common:serverError.required`);
    case 'Tämän kentän arvo ei voi olla "null".':
      return t(`common:serverError.notNull`);
    case 'Tämän luvun on oltava vähintään 0.':
      return t(`common:serverError.min0`);
    default:
      return errorStr;
  }
};
export default parseServerErrorMessage;
