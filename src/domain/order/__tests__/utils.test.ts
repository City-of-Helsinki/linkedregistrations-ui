import { TEST_USER_ID } from '../../user/constants';
import { webStoreOrderPathBuilder } from '../utils';

describe('webStoreOrderPathBuilder function', () => {
  it('should create correct path for web store order request', () => {
    expect(
      webStoreOrderPathBuilder({ id: 'order:1', user: TEST_USER_ID })
    ).toBe('/order/order:1/');
  });
});
