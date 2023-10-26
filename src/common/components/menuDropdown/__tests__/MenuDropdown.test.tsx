import { IconPen } from 'hds-react';
import React from 'react';

import {
  arrowDownKeyPressHelper,
  arrowUpKeyPressHelper,
  configure,
  enterKeyPressHelper,
  escKeyPressHelper,
  render,
  screen,
  tabKeyPressHelper,
  userEvent,
  waitFor,
} from '../../../../utils/testUtils';
import MenuDropdown, { MenuDropdownProps } from '../MenuDropdown';
import { MenuItemOptionProps } from '../types';

configure({ defaultHidden: true });

const items: MenuItemOptionProps[] = [1, 2, 3, 4].map((item) => ({
  icon: <IconPen />,
  onClick: jest.fn(),
  label: `Label ${item}`,
}));

const buttonLabel = 'Select item';

const defaultProps: MenuDropdownProps = {
  buttonAriaLabel: buttonLabel,
  buttonLabel,
  items,
};

const renderMenuDropdown = (props?: Partial<MenuDropdownProps>) => {
  const renderResults = render(<MenuDropdown {...defaultProps} {...props} />);

  const getItemAtIndex = (index: number) =>
    screen.getByRole('button', { name: items[index].label });

  return { ...renderResults, getItemAtIndex };
};

const getToggleButton = () =>
  screen.getByRole('button', { name: defaultProps.buttonLabel });

const findMenu = () =>
  screen.findByRole('region', { name: defaultProps.buttonLabel });

const openMenu = async () => {
  const user = userEvent.setup();
  const toggleButton = getToggleButton();
  await user.click(toggleButton);

  await findMenu();
};

const menuShouldBeClosed = async () =>
  await waitFor(() =>
    expect(
      screen.queryByRole('region', { name: defaultProps.buttonLabel })
    ).not.toBeInTheDocument()
  );

test('changes focused item correctly', async () => {
  const { getItemAtIndex } = renderMenuDropdown();

  await openMenu();

  arrowDownKeyPressHelper();
  expect(getItemAtIndex(0).className).toStrictEqual(
    expect.stringContaining('highlighted')
  );

  arrowDownKeyPressHelper();
  arrowDownKeyPressHelper();
  expect(getItemAtIndex(2).className).toStrictEqual(
    expect.stringContaining('highlighted')
  );

  arrowDownKeyPressHelper();
  expect(getItemAtIndex(3).className).toStrictEqual(
    expect.stringContaining('highlighted')
  );

  arrowDownKeyPressHelper();
  expect(getItemAtIndex(0).className).toStrictEqual(
    expect.stringContaining('highlighted')
  );

  arrowUpKeyPressHelper();
  expect(getItemAtIndex(3).className).toStrictEqual(
    expect.stringContaining('highlighted')
  );
});

test('should call onClick when pressing enter key', async () => {
  renderMenuDropdown();

  await openMenu();

  arrowDownKeyPressHelper();

  enterKeyPressHelper();

  expect(items[0].onClick).toBeCalled();
});

test('calls onClick callback correctly', async () => {
  const user = userEvent.setup();
  const { getItemAtIndex } = renderMenuDropdown();

  await openMenu();

  for (const [index, item] of items.entries()) {
    await user.click(getItemAtIndex(index));
    expect(item.onClick).toHaveBeenCalled();
  }
});

test('menu should be closed with esc key', async () => {
  renderMenuDropdown(defaultProps);

  await openMenu();
  escKeyPressHelper();
  await menuShouldBeClosed();
});

test('menu should be open with arrow up/down key', async () => {
  renderMenuDropdown();

  await openMenu();

  escKeyPressHelper();
  await menuShouldBeClosed();

  arrowDownKeyPressHelper();
  await findMenu();

  escKeyPressHelper();
  await menuShouldBeClosed();

  arrowUpKeyPressHelper();
  await findMenu();
});

test('menu should be closed with tab key', async () => {
  renderMenuDropdown();

  await openMenu();

  await tabKeyPressHelper();
  await menuShouldBeClosed();
});

test('menu should be closed on item click', async () => {
  const user = userEvent.setup();
  const { getItemAtIndex } = renderMenuDropdown({ closeOnItemClick: true });

  await openMenu();

  await user.click(getItemAtIndex(0));
  await menuShouldBeClosed();
});

test('menu should be closed by clicking outside', async () => {
  const user = userEvent.setup();
  const { container } = renderMenuDropdown({ closeOnItemClick: true });

  await openMenu();

  await user.click(container);
  await menuShouldBeClosed();
});
