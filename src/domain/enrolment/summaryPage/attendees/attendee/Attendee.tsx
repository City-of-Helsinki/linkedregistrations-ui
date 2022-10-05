import { IconUser } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';

import FormGroup from '../../../../../common/components/formGroup/FormGroup';
import TextArea from '../../../../../common/components/textArea/TextArea';
import { ATTENDEE_FIELDS } from '../../../constants';
import Divider from '../../../divider/Divider';
import { AttendeeFields } from '../../../types';
import ReadOnlyTextInput from '../../readOnlyTextInput/ReadOnlyTextInput';
import styles from './attendee.module.scss';

type Props = {
  attendee: AttendeeFields;
  attendeePath: string;
};

const Attendee: React.FC<Props> = ({ attendee, attendeePath }) => {
  const { t } = useTranslation('summary');

  const getFieldId = (field: string) => `${attendeePath}.${field}`;

  const getFieldText = (value: string) => value || '-';

  return (
    <div>
      <Divider />
      <IconUser aria-hidden size="m" />
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
            id={getFieldId(ATTENDEE_FIELDS.ZIP)}
            label={t(`labelZip`)}
            value={getFieldText(attendee.zip)}
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
