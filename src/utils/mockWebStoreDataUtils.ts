import { faker } from '@faker-js/faker';
import merge from 'lodash/merge';

import { TEST_ORDER_ID } from '../domain/order/constants';
import {
  WebStoreOrder,
  WebStoreOrderCustomer,
  WebStoreOrderItem,
  WebStoreOrderItemMeta,
  WebStoreOrderMerchant,
  WebStoreOrderPaymentMethod,
} from '../domain/order/types';
import { TEST_PAYMENT_ID } from '../domain/payment/constants';
import {
  WebStorePayment,
  WebStorePaymentPaytrailProvider,
  WebStorePaymentPaytrailProviderParameter,
} from '../domain/payment/types';
import { TEST_USER_ID } from '../domain/user/constants';

export const fakeWebStoreOrderItemMeta = (
  overrides?: Partial<WebStoreOrderItemMeta>
): WebStoreOrderItemMeta => {
  return merge<WebStoreOrderItemMeta, typeof overrides>(
    {
      orderItemMetaId: faker.string.uuid(),
      orderItemId: faker.string.uuid(),
      orderId: TEST_ORDER_ID,
      key: 'eventName',
      value: faker.lorem.sentence(),
      label: faker.lorem.sentence(),
      visibleInCheckout: 'true',
      ordinal: '1',
    },
    overrides
  );
};

export const fakeWebStoreOrderItem = (
  overrides?: Partial<WebStoreOrderItem>
): WebStoreOrderItem => {
  return merge<WebStoreOrderItem, typeof overrides>(
    {
      merchantId: faker.string.uuid(),
      orderItemId: faker.string.uuid(),
      orderId: TEST_ORDER_ID,
      productId: faker.string.uuid(),
      productName: faker.lorem.word(),
      unit: 'kpl',
      quantity: 1,
      rowPriceNet: '0.16',
      rowPriceVat: '0.04',
      rowPriceTotal: '0.2',
      vatPercentage: '24',
      priceNet: '0.16',
      priceVat: '0.04',
      priceGross: '0.2',
      meta: [],
    },
    overrides
  );
};

export const fakeWebStoreOrderCustomer = (
  overrides?: Partial<WebStoreOrderCustomer>
): WebStoreOrderCustomer => {
  return merge<WebStoreOrderCustomer, typeof overrides>(
    {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      phone: '',
    },
    overrides
  );
};

export const fakeWebStoreOrderPaymentMethod = (
  overrides?: Partial<WebStoreOrderPaymentMethod>
): WebStoreOrderPaymentMethod => {
  return merge<WebStoreOrderPaymentMethod, typeof overrides>(
    {
      orderId: TEST_ORDER_ID,
      userId: TEST_USER_ID,
      name: 'Nordea',
      code: 'nordea',
      group: 'bank',
      img: 'https://test.com',
      gateway: 'online-paytrail',
    },
    overrides
  );
};

export const fakeWebStoreOrderMerchant = (
  overrides?: Partial<WebStoreOrderMerchant>
): WebStoreOrderMerchant => {
  return merge<WebStoreOrderMerchant, typeof overrides>(
    {
      merchantShopId: '1071053',
      merchantName: faker.lorem.word(),
      merchantStreet: faker.location.streetAddress(),
      merchantZip: '00100',
      merchantCity: 'Helsinki',
      merchantEmail: faker.internet.email(),
      merchantPhone: faker.phone.number(),
      merchantUrl: faker.internet.url(),
      merchantTermsOfServiceUrl: faker.internet.url(),
      merchantBusinessId: '1234567-8',
    },
    overrides
  );
};

export const fakeWebStoreOrder = (
  overrides?: Partial<WebStoreOrder>
): WebStoreOrder => {
  return merge<WebStoreOrder, typeof overrides>(
    {
      orderId: TEST_ORDER_ID,
      namespace: 'linked_registration',
      user: TEST_USER_ID,
      createdAt: '2024-05-30T11:18:38.376',
      items: [fakeWebStoreOrderItem()],
      customer: fakeWebStoreOrderCustomer(),
      status: 'confirmed',
      type: 'order',
      checkoutUrl: faker.internet.url(),
      receiptUrl: faker.internet.url(),
      loggedInCheckoutUrl: faker.internet.url(),
      updateCardUrl: faker.internet.url(),
      paymentMethod: fakeWebStoreOrderPaymentMethod(),
      incrementId: 1000000001,
      lastValidPurchaseDateTime: '2024-06-01T11:18:38.000Z',
      priceNet: '0.16',
      priceVat: '0.04',
      priceTotal: '0.2',
      isValidForCheckout: false,
      merchant: fakeWebStoreOrderMerchant(),
    },
    overrides
  );
};

export const fakeWebStorePaymentPaytrailProviderParameter = (
  overrides?: Partial<WebStorePaymentPaytrailProviderParameter>
): WebStorePaymentPaytrailProviderParameter => {
  return merge<WebStorePaymentPaytrailProviderParameter, typeof overrides>(
    {
      name: 'VERSION',
      value: '0005',
    },
    overrides
  );
};

export const fakeWebStorePaymentPaytrailProvider = (
  overrides?: Partial<WebStorePaymentPaytrailProvider>
): WebStorePaymentPaytrailProvider => {
  return merge<WebStorePaymentPaytrailProvider, typeof overrides>(
    {
      url: faker.internet.url(),
      icon: faker.internet.url(),
      svg: faker.internet.url(),
      group: 'bank',
      name: 'Nordea',
      id: 'nordea',
      parameters: [],
    },
    overrides
  );
};

export const fakeWebStorePayment = (
  overrides?: Partial<WebStorePayment>
): WebStorePayment => {
  return merge<WebStorePayment, typeof overrides>(
    {
      paymentId: faker.string.uuid(),
      namespace: 'linked_registration',
      orderId: TEST_ORDER_ID,
      userId: TEST_USER_ID,
      status: 'payment_paid_online',
      paymentMethod: 'nordea',
      paymentType: 'order',
      totalExclTax: 0.16,
      total: 0.2,
      taxAmount: 0.04,
      description: null,
      additionalInfo: '{"payment_method": nordea}',
      token: null,
      timestamp: '20240530-111903',
      paymentMethodLabel: 'Nordea',
      paytrailTransactionId: faker.string.uuid(),
      shopInShopPayment: false,
      paytrailProvider: fakeWebStorePaymentPaytrailProvider(),
      paymentGateway: 'online-paytrail',
      createdAt: '2024-05-30T11:19:03.713',
      updatedAt: '2024-05-30T11:19:08.013',
      id: TEST_PAYMENT_ID,
      new: false,
    },
    overrides
  );
};
