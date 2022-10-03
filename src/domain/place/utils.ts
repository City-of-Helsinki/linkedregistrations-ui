import { AxiosError } from 'axios';
import { NextPageContext } from 'next';

import { Language } from '../../types';
import getLocalisedString from '../../utils/getLocalisedString';
import { callGet } from '../app/axios/axiosClient';
import { Place, PlaceFields } from './types';

export const fetchPlace = async (
  id: string,
  ctx?: Pick<NextPageContext, 'req' | 'res'>
): Promise<Event> => {
  try {
    const { data } = await callGet(`/place/${id}/`, undefined, ctx);
    return data;
  } catch (error) {
    /* istanbul ignore next */
    throw Error(JSON.stringify((error as AxiosError).response?.data));
  }
};

export const getPlaceFields = (place: Place, locale: Language): PlaceFields => {
  return {
    addressLocality: getLocalisedString(place.address_locality, locale),
    name: getLocalisedString(place.name, locale),
    streetAddress: getLocalisedString(place.street_address, locale),
  };
};
