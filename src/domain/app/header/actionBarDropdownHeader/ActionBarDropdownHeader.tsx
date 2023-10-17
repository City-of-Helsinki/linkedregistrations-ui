import { FC } from 'react';

import styles from './actionBarDropdownHeader.module.scss';

type Props = {
  title: string;
};

const ActionBarDropdownHeader: FC<Props> = ({ title }) => {
  return <h3 className={styles.actionBarDropdownHeader}>{title}</h3>;
};

export default ActionBarDropdownHeader;
