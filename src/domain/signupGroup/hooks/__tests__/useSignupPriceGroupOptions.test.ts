import { renderHook } from '@testing-library/react';

import {
  fakeLocalisedObject,
  fakePriceGroupDense,
  fakeRegistration,
  fakeRegistrationPriceGroup,
} from '../../../../utils/mockDataUtils';
import { Registration } from '../../../registration/types';
import useSignupPriceGroupOptions from '../useSignupPriceGroupOptions';

const getHookWrapper = (registration: Registration) => {
  const { result } = renderHook(() => useSignupPriceGroupOptions(registration));

  return { result };
};

it('should return empty array if registrationPriceGroups is missing', async () => {
  const { result } = getHookWrapper(
    fakeRegistration({ registration_price_groups: [] })
  );
  expect(result.current).toEqual([]);
});

it('should return registration price group options', async () => {
  const { result } = getHookWrapper(
    fakeRegistration({
      registration_price_groups: [
        fakeRegistrationPriceGroup({
          price_group: fakePriceGroupDense({
            description: fakeLocalisedObject('Price group 1'),
          }),
          id: 1,
          price: '12.00',
        }),
        fakeRegistrationPriceGroup({
          price_group: fakePriceGroupDense({
            description: fakeLocalisedObject('Price group 2'),
          }),
          id: 2,
          price: '1.00',
        }),
        fakeRegistrationPriceGroup({
          price_group: fakePriceGroupDense({
            description: fakeLocalisedObject('Price group 3'),
          }),
          id: 3,
          price: null,
        }),
      ],
    })
  );
  expect(result.current).toEqual([
    {
      label: 'Price group 1 12,00 €',
      price: 12,
      value: '1',
    },
    {
      label: 'Price group 2 1,00 €',
      price: 1,
      value: '2',
    },
    {
      label: 'Price group 3 0,00 €',
      price: 0,
      value: '3',
    },
  ]);
});
