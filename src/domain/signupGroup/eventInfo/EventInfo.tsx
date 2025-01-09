import { IconClock, IconLocation, IconTicket, IconUser, Tag } from 'hds-react';
import capitalize from 'lodash/capitalize';
import React from 'react';

import TextWithIcon from '../../../common/components/textWithIcon/TextWithIcon';
import useLocale from '../../../hooks/useLocale';
import getLocalisedString from '../../../utils/getLocalisedString';
import { Event } from '../../event/types';
import { getEventFields, getEventLocationText } from '../../event/utils';
import { Registration } from '../../registration/types';
import { getRegistrationFields } from '../../registration/utils';
import Instructions from '../instructions/Instructions';

import AudienceAgeText from './AudienceAgeText';
import DateText from './DateText';
import styles from './eventInfo.module.scss';
import EventTimes from './EventTimes';
import PriceText from './PriceText';

type EventInfoProps = {
  event: Event;
  registration: Registration;
};

const EventInfo: React.FC<EventInfoProps> = ({ event, registration }) => {
  const locale = useLocale();
  const {
    description,
    endTime,
    freeEvent,
    imageUrl,
    keywords,
    name,
    offers,
    startTime,
  } = getEventFields(event, locale);
  const { audienceMaxAge, audienceMinAge } = getRegistrationFields(
    registration,
    locale
  );

  const locationText = getEventLocationText({ event, locale });

  return (
    <div className={styles.eventInfo}>
      <div
        className={styles.image}
        style={{
          backgroundImage: imageUrl
            ? `url(${imageUrl})`
            : /* istanbul ignore next */ undefined,
        }}
      ></div>
      <div className={styles.eventInfoWrapper}>
        <div className={styles.nameRow}>
          <h1>{name}</h1>
        </div>
        <div className={styles.descriptionRow}>
          <div dangerouslySetInnerHTML={{ __html: description }}></div>
          <Instructions registration={registration} />
        </div>
        <div className={styles.keywordsRow}>
          {keywords.map((keyword) => (
            <Tag key={keyword.id} id={keyword.id} placeholder={undefined}>
              {capitalize(getLocalisedString(keyword.name, locale))}
            </Tag>
          ))}
        </div>
        <div className={styles.dateRow}>
          {(endTime || startTime) && (
            <TextWithIcon
              icon={<IconClock aria-hidden className={styles.icon} />}
              text={<DateText endTime={endTime} startTime={startTime} />}
            />
          )}

          <TextWithIcon
            icon={<IconLocation aria-hidden className={styles.icon} />}
            text={locationText}
          />
        </div>
        <div className={styles.ticketRow}>
          <TextWithIcon
            icon={<IconTicket aria-hidden className={styles.icon} />}
            text={<PriceText freeEvent={freeEvent} offers={offers} />}
          />
          <TextWithIcon
            icon={<IconUser aria-hidden className={styles.icon} />}
            text={
              <AudienceAgeText
                maxAge={audienceMaxAge}
                minAge={audienceMinAge}
              />
            }
          />
        </div>
        <div className={styles.eventTimesRow}>
          <EventTimes event={event} />
        </div>
      </div>
    </div>
  );
};

export default EventInfo;
