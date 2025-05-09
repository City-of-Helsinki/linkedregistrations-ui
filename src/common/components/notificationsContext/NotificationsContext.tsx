import { NotificationSize } from 'hds-react';
import uniqueId from 'lodash/uniqueId';
import React, {
  createContext,
  FC,
  PropsWithChildren,
  useMemo,
  useState,
} from 'react';

import Notification, { NotificationProps } from '../notification/Notification';

export type AddNotificationFn = (props: NotificationProps) => void;

export type NotificationsContextProps = {
  addNotification: AddNotificationFn;
};

export const NotificationsContext = createContext<
  NotificationsContextProps | undefined
>(undefined);

export const NotificationsProvider: FC<PropsWithChildren> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);

  const value = useMemo<NotificationsContextProps>(() => {
    return {
      addNotification: (props) =>
        setNotifications((items) => [
          ...items,
          { ...props, id: uniqueId('notification-') },
        ]),
    };
  }, [setNotifications]);

  const heights = useMemo(
    () =>
      // Height of last added notification is 0 because it's not rendered yet.
      // In this case it doesn't matter because it's not used for top-margin calculation
      notifications.map(
        ({ id }) =>
          document.getElementById(id as string)?.children[0]?.clientHeight ?? 0
      ),
    [notifications]
  );

  return (
    <NotificationsContext.Provider value={value}>
      {notifications.map((props, index) => {
        const removeNotification = () =>
          setNotifications((items) => items.filter((i) => i.id !== props.id));
        const getNotificationStyle = (): React.CSSProperties => {
          const offset = 32;
          const topMargin = heights
            .slice(0, -(notifications.length - index))
            .reduce((acc, curr) => acc + curr + offset, offset);

          return {
            top: topMargin,
            zIndex: 1000,
          };
        };
        return (
          <Notification
            notificationAriaLabel={
              typeof props.label === 'string'
                ? props.label
                : /* istanbul ignore next */
                  undefined
            }
            {...props}
            style={getNotificationStyle()}
            key={props.id}
            size={NotificationSize.Medium}
            position="top-right"
            autoClose={true}
            onClose={removeNotification}
          />
        );
      })}
      {children}
    </NotificationsContext.Provider>
  );
};
