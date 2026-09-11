import uniqueId from 'lodash/uniqueId';
import React, {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import styles from './accessibilityNotification.module.scss';

export type SetAccessibilityTextFn = (text: string) => void;

export type AccessibilityNotificationProps = { id: string; text: string };

export type AccessibilityNotificationContextProps = {
  setAccessibilityText: SetAccessibilityTextFn;
};

export const AccessibilityNotificationContext = createContext<
  AccessibilityNotificationContextProps | undefined
>(undefined);

const scheduleTimeout = (
  timeouts: Set<ReturnType<typeof setTimeout>>,
  callback: () => void,
  delay: number
) => {
  const timeoutId = setTimeout(() => {
    timeouts.delete(timeoutId);
    callback();
  }, delay);

  timeouts.add(timeoutId);
};

export const AccessibilityNotificationProvider: FC<PropsWithChildren> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<
    AccessibilityNotificationProps[]
  >([]);
  const timeoutsRef = useRef(new Set<ReturnType<typeof setTimeout>>());

  useEffect(() => {
    const timeouts = timeoutsRef.current;

    return () => {
      timeouts.forEach(clearTimeout);
      timeouts.clear();
    };
  }, []);

  const removeNotification = (notificationId: string) => {
    setNotifications((items) =>
      items.filter(({ id }) => id !== notificationId)
    );
  };

  const updateNotificationText = (text: string, notificationId: string) =>
    setNotifications((items) =>
      items.map((notification) =>
        notification.id === notificationId
          ? { ...notification, text }
          : notification
      )
    );

  const setAccessibilityText = useCallback((text: string) => {
    const notificationId = uniqueId('accessibility-notification-');

    setNotifications((items) => [...items, { id: notificationId, text: '' }]);
    // Change notification text after 100ms to force screen reader
    // to read the notification. Clear the notification after 1000ms.
    scheduleTimeout(timeoutsRef.current, () => {
      updateNotificationText(text, notificationId);
    }, 100);
    scheduleTimeout(timeoutsRef.current, () => {
      removeNotification(notificationId);
    }, 1000);
  }, []);

  const value = useMemo(
    () => ({
      setAccessibilityText,
    }),
    [setAccessibilityText]
  );

  return (
    <AccessibilityNotificationContext.Provider value={value}>
      {notifications.map(({ text, id }) => (
        <output key={id} className={styles.accessibilityNotification}>
          {text}
        </output>
      ))}

      {children}
    </AccessibilityNotificationContext.Provider>
  );
};
