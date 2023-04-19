import { IconUser } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';

import FormGroup from '../../../../../common/components/formGroup/FormGroup';
import TextArea from '../../../../../common/components/textArea/TextArea';
import { ATTENDEE_FIELDS } from '../../../constants';
import Divider from '../../../divider/Divider';
import InWaitingListInfo from '../../../inWaitingListInfo/InWaitingListInfo';
import { AttendeeFields } from '../../../types';
import ReadOnlyTextInput from '../../readOnlyTextInput/ReadOnlyTextInput';
import styles from './attendee.module.scss';

export type AttendeeProps = {
  attendee: AttendeeFields;
  attendeePath: string;
};

const Attendee: React.FC<AttendeeProps> = ({ attendee, attendeePath }) => {
  const { t } = useTranslation('summary');

  const getFieldId = (field: string) => `${attendeePath}.${field}`;

  const getFieldText = (value: string) => value || '-';

  return (
    <div>
      <Divider />
      <div className={styles.iconRow}>
        <IconUser aria-hidden className={styles.icon} size="m" />
        {attendee.inWaitingList && <InWaitingListInfo />}
      </div>
      <FormGroup>
        <ReadOnlyTextInput
          id={getFieldId(ATTENDEE_FIELDS.NAME)}
          label={t(`labelName`)}
          value={getFieldText(attendee.name)}
        />
      </FormGroup>
      <FormGroup>
        <div className={styles.streetAddressRow}>
          <ReadOnlyTextInput
            id={getFieldId(ATTENDEE_FIELDS.DATE_OF_BIRTH)}
            label={t(`labelDateOfBirth`)}
            value={getFieldText(attendee.dateOfBirth)}
          />
          <ReadOnlyTextInput
            id={getFieldId(ATTENDEE_FIELDS.STREET_ADDRESS)}
            label={t(`labelStreetAddress`)}
            value={getFieldText(attendee.streetAddress)}
          />
        </div>
      </FormGroup>
      <FormGroup>
        <div className={styles.zipRow}>
          <ReadOnlyTextInput
            id={getFieldId(ATTENDEE_FIELDS.ZIPCODE)}
            label={t(`labelZipcode`)}
            value={getFieldText(attendee.zipcode)}
          />
          <ReadOnlyTextInput
            id={getFieldId(ATTENDEE_FIELDS.CITY)}
            label={t(`labelCity`)}
            value={getFieldText(attendee.city)}
          />
        </div>
      </FormGroup>
      <TextArea
        id={getFieldId(ATTENDEE_FIELDS.EXTRA_INFO)}
        className={styles.textArea}
        readOnly
        label={t(`labelAttendeeExtraInfo`)}
        value={getFieldText(attendee.extraInfo)}
      />
    </div>
  );
};

export default Attendee;
