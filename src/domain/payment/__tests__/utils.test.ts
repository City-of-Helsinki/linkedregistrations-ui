import { TEST_USER_ID } from '../../user/constants';
import { webStorePaymentPathBuilder } from '../utils';

describe('webStorePaymentPathBuilder function', () => {
  it('should create correct path for web store payment request', () => {
    expect(
      webStorePaymentPathBuilder({ id: 'payment:1', user: TEST_USER_ID })
    ).toBe('/payment/payment:1/');
  });
});
