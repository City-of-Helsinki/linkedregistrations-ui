import useLocale from '../../../hooks/useLocale';
import { Event } from '../../event/types';
import { getPlaceFields } from '../../place/utils';

const useEventLocationText = (event: Event): string => {
  const locale = useLocale();
  const { location } = event;
  const {
    addressLocality,
    name: locationName,
    streetAddress,
  } = location
    ? getPlaceFields(location, locale)
    : { addressLocality: '', name: '', streetAddress: '' };

  return (
    [locationName, streetAddress, addressLocality]
      .filter((e) => e)
      .join(', ') || '-'
  );
};

export default useEventLocationText;
