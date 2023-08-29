import { IconLocation, IconTicket, IconUser } from 'hds-react';
import React from 'react';

import TextWithIcon from '../../../../common/components/textWithIcon/TextWithIcon';
import useLocale from '../../../../hooks/useLocale';
import AudienceAgeText from '../../../enrolment/eventInfo/AudienceAgeText';
import DateText from '../../../enrolment/eventInfo/DateText';
import PriceText from '../../../enrolment/eventInfo/PriceText';
import useEventLocationText from '../../../event/hooks/useEventLocationText';
import { getEventFields } from '../../../event/utils';
import { Registration } from '../../../registration/types';
import { getRegistrationFields } from '../../../registration/utils';
import styles from './summaryEventInfo.module.scss';

type EventInfoProps = {
  registration: Registration;
};

const EventInfo: React.FC<EventInfoProps> = ({ registration }) => {
  const locale = useLocale();
  const { event } = registration;
  const { endTime, freeEvent, name, offers, startTime } = getEventFields(
    event,
    locale
  );
  const { audienceMaxAge, audienceMinAge } = getRegistrationFields(
    registration,
    locale
  );

  const locationText = useEventLocationText(event);

  return (
    <div className={styles.summaryEventInfo}>
      <div className={styles.nameRow}>
        <h1>{name}</h1>
      </div>
      <div className={styles.dateRow}>
        {(endTime || startTime) && (
          <TextWithIcon
            text={<DateText endTime={endTime} startTime={startTime} />}
          />
        )}

        <TextWithIcon
          icon={<IconLocation aria-hidden className={styles.icon} />}
          size="l"
          text={locationText}
        />
      </div>
      <div className={styles.ticketRow}>
        <TextWithIcon
          icon={<IconTicket aria-hidden className={styles.icon} />}
          size="s"
          text={<PriceText freeEvent={freeEvent} offers={offers} />}
        />
        <TextWithIcon
          icon={<IconUser aria-hidden className={styles.icon} />}
          size="s"
          text={
            <AudienceAgeText maxAge={audienceMaxAge} minAge={audienceMinAge} />
          }
        />
      </div>
    </div>
  );
};

export default EventInfo;