import { IconClock, IconLocation, IconTicket, IconUser, Tag } from 'hds-react';
import capitalize from 'lodash/capitalize';
import React from 'react';

import useLocale from '../../../hooks/useLocale';
import getLocalisedString from '../../../utils/getLocalisedString';
import useEventLocation from '../../event/hooks/useEventLocation';
import { Event } from '../../event/types';
import { getEventFields } from '../../event/utils';
import { getPlaceFields } from '../../place/utils';
import AudienceAgeText from './AudienceAgeText';
import DateText from './DateText';
import styles from './eventInfo.module.scss';
import PriceText from './PriceText';
import TextWithIcon from './TextWithIcon';

type EventInfoProps = {
  event: Event;
};

const EventInfo: React.FC<EventInfoProps> = ({ event }) => {
  const locale = useLocale();
  const {
    audienceMaxAge,
    audienceMinAge,
    description,
    endTime,
    freeEvent,
    imageUrl,
    keywords,
    name,
    offers,
    startTime,
  } = getEventFields(event, locale);

  const { location } = useEventLocation(event);
  const {
    addressLocality,
    name: locationName,
    streetAddress,
  } = location
    ? getPlaceFields(location, locale)
    : { addressLocality: '', name: '', streetAddress: '' };
  const locationText =
    [locationName, streetAddress, addressLocality]
      .filter((e) => e)
      .join(', ') || '-';

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
        </div>
        <div className={styles.keywordsRow}>
          {keywords.map((keyword, index) => (
            <Tag key={index} id={keyword.id}>
              {capitalize(getLocalisedString(keyword.name, locale))}
            </Tag>
          ))}
        </div>
        <div className={styles.dateRow}>
          <TextWithIcon
            icon={<IconClock aria-hidden className={styles.icon} />}
            text={<DateText endTime={endTime} startTime={startTime} />}
          />
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
      </div>
    </div>
  );
};

export default EventInfo;