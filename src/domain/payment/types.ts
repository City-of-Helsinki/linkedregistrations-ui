import { stringOrNull } from '../api/types';

export type WebStorePaymentPaytrailProviderParameter = {
  name: string;
  value: string;
};

export type WebStorePaymentPaytrailProvider = {
  url: string;
  icon: string;
  svg: string;
  group: string;
  name: string;
  id: string;
  parameters: WebStorePaymentPaytrailProviderParameter[];
};

export type WebStorePayment = {
  paymentId: string;
  namespace: string;
  orderId: string;
  userId: string;
  status: string;
  paymentMethod: string;
  paymentType: string;
  totalExclTax: number;
  total: number;
  taxAmount: number;
  description: stringOrNull;
  additionalInfo: string;
  token: stringOrNull;
  timestamp: string;
  paymentMethodLabel: string;
  paytrailTransactionId: string;
  shopInShopPayment: boolean;
  paytrailProvider: WebStorePaymentPaytrailProvider;
  paymentGateway: string;
  createdAt: string;
  updatedAt: string;
  id: string;
  new: boolean;
};

export type WebStorePaymentQueryVariables = {
  id: string;
  user: string;
};
