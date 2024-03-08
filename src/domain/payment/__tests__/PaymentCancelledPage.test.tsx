/* eslint-disable max-len */
import React from 'react';

import { render, screen } from '../../../utils/testUtils';
import PaymentCancelledPage from '../PaymentCancelledPage';

const renderComponent = () => render(<PaymentCancelledPage />);

test('should render payment cancelled page', () => {
  renderComponent();

  expect(
    screen.getByRole('heading', { name: 'Maksu on peruutettu' })
  ).toBeInTheDocument();

  expect(
    screen.getByText(
      'Maksua ei suoritettu ja ilmoittautuminen tapahtumaan on peruttu.'
    )
  ).toBeInTheDocument();
});
