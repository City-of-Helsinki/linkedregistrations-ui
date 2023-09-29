import React from 'react';

import { configure, render } from '../../../../utils/testUtils';
import PageWrapper from '../PageWrapper';

configure({ defaultHidden: true });

const renderComponent = () =>
  render(<PageWrapper backgroundColor="coatOfArms" />);

test('should render component', () => {
  const { container } = renderComponent();

  expect(container).toMatchSnapshot();
});
