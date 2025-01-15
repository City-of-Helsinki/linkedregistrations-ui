import { ResizeObserver } from '@juggle/resize-observer';
import classNames from 'classnames';
import { ButtonProps, IconAngleDown, IconAngleUp } from 'hds-react';
import React, { useRef, useState } from 'react';
import mergeRefs from 'react-merge-refs';
import useMeasure from 'react-use-measure';

import useClickOrFocusOutside from '../../../hooks/useClickOrFocusOutside';
import useDropdownKeyboardNavigation from '../../../hooks/useDropdownKeyboardNavigation';
import useIdWithPrefix from '../../../hooks/useIdWithPrefix';
import Button from '../button/Button';

import Menu, { MenuPosition } from './menu/Menu';
import styles from './menuDropdown.module.scss';
import { MenuItemOptionProps } from './types';

export type MenuDropdownProps = React.PropsWithChildren<{
  buttonAriaLabel?: string;
  buttonLabel: string;
  className?: string;
  closeOnItemClick?: boolean;
  fixedPosition?: boolean;
  id?: string;
  items: MenuItemOptionProps[];
  menuPosition?: MenuPosition;
}>;

const MenuDropdown: React.FC<MenuDropdownProps> = ({
  buttonAriaLabel,
  buttonLabel,
  className,
  closeOnItemClick,
  fixedPosition = false,
  id: _id,
  items,
  menuPosition,
}) => {
  const disabledIndices = items.reduce(
    (acc: number[], item, i) => (item.disabled ? [...acc, i] : acc),
    []
  );
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  const [ref, menuContainerSize] = useMeasure({
    // Detect scroll events only if menu is open to improve performance
    scroll:
      /* istanbul ignore next */
      fixedPosition && menuOpen,
    polyfill: ResizeObserver,
  });

  const toggleButton = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const id = useIdWithPrefix({ id: _id, prefix: 'menu-dropdown-' });
  const buttonId = `${id}-button`;
  const menuId = `${id}-menu`;

  const ensureMenuIsClosed = () => {
    /* istanbul ignore else */
    if (menuOpen) {
      setMenuOpen(false);
      setFocusedIndex(-1);
    }
  };

  const ensureMenuIsOpen = () => {
    /* istanbul ignore else */
    if (!menuOpen) {
      setMenuOpen(true);
    }
  };

  const setFocusToButton = () => {
    toggleButton.current?.focus();
  };

  const handleItemClick = () => {
    if (closeOnItemClick) {
      ensureMenuIsClosed();
      setFocusToButton();
    }
  };

  const {
    setup: setupClickOrFocusOutside,
    teardown: teardownClickOrFocusOutside,
  } = useClickOrFocusOutside({
    container: containerRef,
    onClickOrFocusOutside: ensureMenuIsClosed,
  });

  const {
    focusedIndex,
    setFocusedIndex,
    setup: setupKeyboardNav,
    teardown: teardownKeyoboardNav,
  } = useDropdownKeyboardNavigation({
    container: containerRef,
    disabledIndices: disabledIndices,
    listLength: items.length,
    onKeyDown: (event) => {
      const item = items[focusedIndex];

      switch (event.key) {
        case 'ArrowUp':
        case 'ArrowDown':
          ensureMenuIsOpen();
          break;
        case 'Escape':
          ensureMenuIsClosed();
          setFocusToButton();
          break;
        case 'Enter':
          /* istanbul ignore else */
          if (menuOpen && item) {
            item.onClick();
            handleItemClick();
            event.preventDefault();
          }
          break;
        case 'Tab':
          ensureMenuIsClosed();
          break;
      }
    },
  });

  React.useEffect(() => {
    setupKeyboardNav();
    setupClickOrFocusOutside();
    return () => {
      teardownKeyoboardNav();
      teardownClickOrFocusOutside();
    };
  });

  const getToggleButton = () => {
    const commonProps: Partial<ButtonProps> = {
      id: buttonId,
      'aria-label': buttonAriaLabel || buttonLabel,
      'aria-haspopup': true,
      'aria-controls': menuId,
      'aria-expanded': menuOpen,
      onClick: toggleMenu,
      type: 'button',
    };
    return (
      <Button
        {...commonProps}
        ref={toggleButton}
        fullWidth={true}
        iconRight={
          menuOpen ? <IconAngleUp aria-hidden /> : <IconAngleDown aria-hidden />
        }
        variant="secondary"
      >
        <span>{buttonLabel}</span>
      </Button>
    );
  };

  const toggleMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    setMenuOpen(!menuOpen);
  };

  return (
    <div
      ref={mergeRefs<HTMLDivElement>([ref, containerRef])}
      className={classNames(styles.menuDropdown, className)}
    >
      {getToggleButton()}
      <Menu
        ariaLabelledBy={buttonId}
        fixedPosition={fixedPosition}
        focusedIndex={focusedIndex}
        id={menuId}
        items={items}
        onItemClick={handleItemClick}
        menuContainerSize={menuContainerSize}
        menuOpen={menuOpen}
        menuPosition={menuPosition}
        setFocusedIndex={setFocusedIndex}
      />
    </div>
  );
};

export default MenuDropdown;
