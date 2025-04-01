import { ButtonProps, ButtonVariant, IconCalendar } from 'hds-react';
import { useTranslation } from 'next-i18next';
import { FC, MouseEventHandler } from 'react';

import Button from '../../../common/components/button/Button';
import { useNotificationsContext } from '../../../common/components/notificationsContext/hooks/useNotificationsContext';
import useLocale from '../../../hooks/useLocale';
import { SuperEventType } from '../constants';
import useEventWithSubEventsData from '../hooks/useEventWithSubEventsData';
import { Event } from '../types';
import { downloadEventIcsFile } from '../utils';

export type EventCalendarButtonProps = {
  event: Event;
  onClick?: MouseEventHandler<HTMLButtonElement>;
} & Omit<ButtonProps, 'children' | 'onClick'>;

const EventCalendarButton: FC<EventCalendarButtonProps> = ({
  disabled,
  event,
  onClick,
  variant = ButtonVariant.Secondary,
  ...rest
}) => {
  const locale = useLocale();
  const { t } = useTranslation('common');
  const { addNotification } = useNotificationsContext();

  const { eventWithSubEvents, isLoading: isLoadingEvent } =
    useEventWithSubEventsData({
      id: event.id,
      superEventType: event.super_event_type,
    });

  const handleClick: MouseEventHandler<HTMLButtonElement> = (ev) => {
    if (onClick) {
      onClick(ev);
    } else {
      downloadEventIcsFile({
        addNotification,
        event:
          event.super_event_type === SuperEventType.Recurring
            ? (eventWithSubEvents as Event)
            : event,
        locale,
        t,
      });
    }
  };

  return (
    <Button
      {...rest}
      disabled={
        // istanbul ignore next
        isLoadingEvent ?? disabled
      }
      iconStart={<IconCalendar aria-hidden={true} />}
      onClick={handleClick}
      variant={variant}
    >
      {t('common:eventCalendarButton.label')}
    </Button>
  );
};

export default EventCalendarButton;
