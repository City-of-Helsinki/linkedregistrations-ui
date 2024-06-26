import classNames from 'classnames';
import {
  Notification as HdsNotification,
  NotificationProps as HdsNotificationProps,
} from 'hds-react';
import React from 'react';

import styles from './notification.module.scss';

export type NotificationProps = { id?: string } & HdsNotificationProps;

const Notification: React.FC<NotificationProps> = (props) => {
  /* istanbul ignore next */
  const { className, id, type = 'success', ...rest } = props;
  return (
    <div id={id}>
      <HdsNotification
        {...rest}
        className={classNames(styles.notification, className)}
        type={type}
      />
    </div>
  );
};

export default Notification;
