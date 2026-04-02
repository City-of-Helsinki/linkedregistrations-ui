import React from 'react';

import {
  act,
  configure,
  render,
  screen,
  userEvent,
} from '../../../../../utils/testUtils';
import ConfirmDeleteSignupFromFormModal, {
  ConfirmDeleteSignupFromFormModalProps,
} from '../ConfirmDeleteSignupFromFormModal';

configure({ defaultHidden: true });

const defaultProps: ConfirmDeleteSignupFromFormModalProps = {
  isOpen: true,
  isSaving: false,
  onClose: vi.fn(),
  onDelete: vi.fn(),
  participantCount: 1,
};

const renderComponent = (
  props: Partial<ConfirmDeleteSignupFromFormModalProps>
) => render(<ConfirmDeleteSignupFromFormModal {...defaultProps} {...props} />);

test('should call onCancel', async () => {
  const onDelete = vi.fn();
  const user = userEvent.setup();
  renderComponent({ onDelete });

  const deleteParticipantButton = screen.getByRole('button', {
    name: 'Poista osallistuja',
  });
  await act(async () => await user.click(deleteParticipantButton));
  expect(onDelete).toBeCalled();
});

test('should call onClose', async () => {
  const onClose = vi.fn();
  const user = userEvent.setup();
  renderComponent({ onClose });

  const closeButton = screen.getByRole('button', { name: 'Peruuta' });
  await act(async () => await user.click(closeButton));
  expect(onClose).toBeCalled();
});
