import React from 'react';

import { configure, render } from '../../../../utils/testUtils';
import SearchRow, { SearchRowProps } from '../SearchRow';

configure({ defaultHidden: true });

const defaultProps: SearchRowProps = {
  countText: '100 items',
  onSearchChange: jest.fn(),
  onSearchSubmit: jest.fn(),
  searchInputLabel: 'Search',
  searchValue: '',
};

const renderComponent = () => render(<SearchRow {...defaultProps} />);

test('should render component', () => {
  const { container } = renderComponent();

  expect(container).toMatchSnapshot();
});
