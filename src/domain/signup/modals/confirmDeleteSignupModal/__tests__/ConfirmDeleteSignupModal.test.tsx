import React from 'react';

import {
  act,
  configure,
  render,
  screen,
  userEvent,
} from '../../../../../utils/testUtils';
import ConfirmDeleteSignupModal, {
  ConfirmDeleteSignupModalProps,
} from '../ConfirmDeleteSignupModal';

configure({ defaultHidden: true });

const defaultProps: ConfirmDeleteSignupModalProps = {
  isOpen: true,
  isSaving: false,
  onClose: jest.fn(),
  onDelete: jest.fn(),
};

const renderComponent = (props: Partial<ConfirmDeleteSignupModalProps>) =>
  render(<ConfirmDeleteSignupModal {...defaultProps} {...props} />);

test('should call onDelete', async () => {
  const onDelete = jest.fn();
  const user = userEvent.setup();
  renderComponent({ onDelete });

  const cancelButton = screen.getByRole('button', {
    name: 'Peruuta ilmoittautuminen',
  });
  await act(async () => await user.click(cancelButton));
  expect(onDelete).toBeCalled();
});

test('should call onClose', async () => {
  const onClose = jest.fn();
  const user = userEvent.setup();
  renderComponent({ onClose });

  const closeButton = screen.getByRole('button', { name: 'Peruuta' });
  await act(async () => await user.click(closeButton));
  expect(onClose).toBeCalled();
});
