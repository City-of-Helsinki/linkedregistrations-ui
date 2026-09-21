import orderBy from 'lodash/orderBy';
import { useTranslation } from 'next-i18next/pages';
import { FC, useState } from 'react';

import Accordion from '../../../common/components/accordion/Accordion';
import LoadingSpinner from '../../../common/components/loadingSpinner/LoadingSpinner';
import useLocale from '../../../hooks/useLocale';
import useEventWithSubEventsData from '../../event/hooks/useEventWithSubEventsData';
import { Event } from '../../event/types';
import { getEventFields } from '../../event/utils';

import DateText from './DateText';
import styles from './eventInfo.module.scss';

export type EventTimesProps = {
  event: Event;
};

const EventTimes: FC<EventTimesProps> = ({ event }) => {
  const { t } = useTranslation('signup');
  const [open, setOpen] = useState(false);
  const locale = useLocale();

  const toggle = () => {
    setOpen((s) => !s);
  };

  const { eventWithSubEvents, isLoading: isLoadingEvent } =
    useEventWithSubEventsData({
      id: event.id,
      superEventType: event.super_event_type,
    });

  if (!event.super_event_type) {
    return null;
  }

  return (
    <Accordion
      className={styles.eventTimesAccordion}
      open={open}
      onClick={toggle}
      toggleButtonLabel={t('signup:eventTimes')}
    >
      <LoadingSpinner isLoading={isLoadingEvent}>
        <ul>
          {orderBy(
            eventWithSubEvents?.sub_events,
            ['start_time', 'end_time'],
            ['asc', 'asc']
          ).map((item) => {
            const { endTime, startTime } = getEventFields(item, locale);
            return (
              <li key={item.id}>
                <DateText endTime={endTime} startTime={startTime} />
              </li>
            );
          })}
        </ul>
      </LoadingSpinner>
    </Accordion>
  );
};

export default EventTimes;
