import { stringOrNull } from '../api/types';

export type WebStoreOrderItemMeta = {
  orderItemMetaId: string;
  orderItemId: string;
  orderId: string;
  key: string;
  label?: stringOrNull;
  value: string;
  visibleInCheckout: string;
  ordinal: string;
};
export type WebStoreOrderItem = {
  merchantId: string;
  orderItemId: string;
  orderId: string;
  productId: string;
  productName: string;
  unit: string;
  quantity: number;
  rowPriceNet: string;
  rowPriceVat: string;
  rowPriceTotal: string;
  vatPercentage: string;
  priceNet: string;
  priceVat: string;
  priceGross: string;
  meta: WebStoreOrderItemMeta[];
};

export type WebStoreOrderCustomer = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export type WebStoreOrderPaymentMethod = {
  orderId: string;
  userId: string;
  name: string;
  code: string;
  group: string;
  img: string;
  gateway: string;
};

export type WebStoreOrderMerchant = {
  merchantShopId: string;
  merchantName: string;
  merchantStreet: string;
  merchantZip: string;
  merchantCity: string;
  merchantEmail: string;
  merchantPhone: string;
  merchantUrl: string;
  merchantTermsOfServiceUrl: string;
  merchantBusinessId: string;
};

export type WebStoreOrder = {
  orderId: string;
  namespace: string;
  user: string;
  createdAt: string;
  items: WebStoreOrderItem[];
  customer: WebStoreOrderCustomer;
  status: string;
  type: string;
  checkoutUrl: string;
  receiptUrl: string;
  loggedInCheckoutUrl: string;
  updateCardUrl: string;
  paymentMethod: WebStoreOrderPaymentMethod;
  incrementId: number;
  lastValidPurchaseDateTime: string;
  priceNet: string;
  priceVat: string;
  priceTotal: string;
  isValidForCheckout: boolean;
  merchant: WebStoreOrderMerchant;
};

export type WebStoreOrderQueryVariables = {
  id: string;
  user: string;
};
