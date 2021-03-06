import { IconAlertCircle } from 'hds-react';
import React from 'react';

import Container from '../../../domain/app/layout/container/Container';
import styles from './errorTemplate.module.scss';

interface Props {
  text: string;
  title: string;
}

const ErrorTemplate: React.FC<Props> = ({ text, title }) => {
  return (
    <Container contentWrapperClassName={styles.errorTemplate}>
      <div className={styles.content}>
        <IconAlertCircle className={styles.icon} />
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
    </Container>
  );
};

export default ErrorTemplate;
