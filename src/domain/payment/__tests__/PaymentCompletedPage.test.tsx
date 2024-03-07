/* eslint-disable max-len */
import React from 'react';

import { render, screen } from '../../../utils/testUtils';
import PaymentCompletedPage from '../PaymentCompletedPage';

const renderComponent = () => render(<PaymentCompletedPage />);

test('should render payment completed page', () => {
  renderComponent();

  expect(
    screen.getByRole('heading', { name: 'Maksu on suoritettu onnistuneesti' })
  ).toBeInTheDocument();

  expect(
    screen.getByText(
      'Maksu on suoritettu onnistuneesti ja vahvistus tapahtumaan ilmoittautumisesta on lähetetty toimittamaasi sähköpostiosoitteeseen.'
    )
  ).toBeInTheDocument();
});
