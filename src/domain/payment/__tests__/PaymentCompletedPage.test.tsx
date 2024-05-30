/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-require-imports */
import { rest } from 'msw';
import singletonRouter from 'next/router';
import React from 'react';

import {
  fakeWebStoreOrder,
  fakeWebStorePayment,
} from '../../../utils/mockWebStoreDataUtils';
import { render, screen, setQueryMocks } from '../../../utils/testUtils';
import { ROUTES } from '../../app/routes/constants';
import { TEST_ORDER_ID } from '../../order/constants';
import { TEST_USER_ID } from '../../user/constants';
import PaymentCompletedPage from '../PaymentCompletedPage';

jest.mock('next/dist/client/router', () => require('next-router-mock'));

const renderComponent = () => render(<PaymentCompletedPage />);

const order = fakeWebStoreOrder();
const payment = fakeWebStorePayment();

const mocks = [
  rest.get(`*/order/${TEST_ORDER_ID}`, (req, res, ctx) =>
    res(ctx.status(200), ctx.json(order))
  ),
  rest.get(`*/payment/${TEST_ORDER_ID}`, (req, res, ctx) =>
    res(ctx.status(200), ctx.json(payment))
  ),
];

beforeEach(() => {
  setQueryMocks(...mocks);
});

test('should render payment completed page', async () => {
  singletonRouter.push({
    pathname: ROUTES.PAYMENT_SUCCESS,
    query: { orderId: TEST_ORDER_ID, user: TEST_USER_ID },
  });
  renderComponent();

  expect(
    await screen.findByRole('heading', {
      name: 'Maksu on suoritettu onnistuneesti',
    })
  ).toBeInTheDocument();

  expect(
    screen.getByText(
      'Maksu on suoritettu onnistuneesti ja vahvistus tapahtumaan ilmoittautumisesta on lähetetty toimittamaasi sähköpostiosoitteeseen.'
    )
  ).toBeInTheDocument();
});
