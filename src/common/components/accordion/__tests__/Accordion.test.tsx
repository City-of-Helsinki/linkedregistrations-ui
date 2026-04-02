import React from 'react';

import {
  configure,
  render,
  screen,
  userEvent,
} from '../../../../utils/testUtils';
import Accordion, { AccordionProps } from '../Accordion';

configure({ defaultHidden: true });

const content = 'Accordion content';
const toggleButtonLabel = 'Toggle';

const defaultProps: AccordionProps = {
  toggleButtonLabel,
  open: true,
  onClick: vi.fn(),
};

const renderComponent = (props?: Partial<AccordionProps>) =>
  render(
    <Accordion {...defaultProps} {...props}>
      {content}
    </Accordion>
  );

test('should not show contentif accordion is not open', async () => {
  renderComponent({ open: false });

  expect(
    screen.queryByRole('region', { hidden: false })
  ).not.toBeInTheDocument();
});

test('should show contentif accordion is open', async () => {
  renderComponent({ open: true });

  screen.getByRole('region', { hidden: false });
});

test('should call onClick', async () => {
  const user = userEvent.setup();
  const onClick = vi.fn();

  renderComponent({ open: true, onClick });

  const toggleButton = screen.getByRole('button', { name: toggleButtonLabel });
  await user.click(toggleButton);
  expect(onClick).toBeCalled();
});

test('should call onClick by pressing enter', async () => {
  const user = userEvent.setup();
  const onClick = vi.fn();

  renderComponent({ open: true, onClick });

  const toggleButton = screen.getByRole('button', { name: toggleButtonLabel });
  await user.type(toggleButton, '{enter}');
  expect(onClick).toBeCalled();
});
