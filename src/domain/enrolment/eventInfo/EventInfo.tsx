import { IconClock, IconLocation, IconTicket, IconUser, Tag } from 'hds-react';
import capitalize from 'lodash/capitalize';
import React from 'react';

import TextWithIcon from '../../../common/components/textWithIcon/TextWithIcon';
import useLocale from '../../../hooks/useLocale';
import getLocalisedString from '../../../utils/getLocalisedString';
import useEventLocationText from '../../event/hooks/useEventLocationText';
import { Event } from '../../event/types';
import { getEventFields } from '../../event/utils';
import { Registration } from '../../registration/types';
import { getRegistrationFields } from '../../registration/utils';
import AudienceAgeText from './AudienceAgeText';
import DateText from './DateText';
import styles from './eventInfo.module.scss';
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
  const { audienceMaxAge, audienceMinAge } =
    getRegistrationFields(registration);

  const locationText = useEventLocationText(event);

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
          {keywords.map((keyword) => (
            <Tag key={keyword.id} id={keyword.id}>
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
      </div>
    </div>
  );
};

export default EventInfo;
