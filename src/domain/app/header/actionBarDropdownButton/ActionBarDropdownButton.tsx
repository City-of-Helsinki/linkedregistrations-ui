import classNames from 'classnames';
import { FC, PropsWithChildren } from 'react';

import styles from './actionBarDropdownButton.module.scss';

type Props = {
  iconRight?: React.ReactElement;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const ActionBarDropdowButton: FC<PropsWithChildren<Props>> = ({
  children,
  className,
  iconRight,
  type = 'button',
  ...rest
}) => {
  return (
    <button
      {...rest}
      type={type}
      className={classNames(styles.link, className)}
    >
      {children}
      {iconRight}
    </button>
  );
};

export default ActionBarDropdowButton;
