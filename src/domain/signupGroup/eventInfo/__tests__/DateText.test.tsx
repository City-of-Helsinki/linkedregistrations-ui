import { render, screen } from '@testing-library/react';
import React from 'react';

import DateText, { DateTextProps } from '../DateText';

const renderComponent = (props: DateTextProps) =>
  render(<DateText {...props} />);

test('should render correct text when startTime and endTime at same day', () => {
  renderComponent({
    endTime: new Date('2021-01-04'),
    startTime: new Date('2021-01-04'),
  });
  screen.getByText('4.1.2021, 02.00 – 02.00');
});

test('should render correct text when startTime and endTime are defined', () => {
  renderComponent({
    endTime: new Date('2021-01-24'),
    startTime: new Date('2021-01-04'),
  });
  screen.getByText('4 – 24.1.2021');
});

test('should render correct text when only startTime is defined', () => {
  renderComponent({
    endTime: null,
    startTime: new Date('2021-01-24'),
  });
  screen.getByText('24.1.2021, 02.00 –');
});
