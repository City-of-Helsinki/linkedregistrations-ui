import classNames from 'classnames';
import { FastField as Field } from 'formik';
import { Fieldset, IconTrash } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';

import Accordion from '../../../../../common/components/accordion/Accordion';
import DateInputField from '../../../../../common/components/formFields/DateInputField';
import TextAreaField from '../../../../../common/components/formFields/TextAreaField';
import TextInputField from '../../../../../common/components/formFields/TextInputField';
import FormGroup from '../../../../../common/components/formGroup/FormGroup';
import useLocale from '../../../../../hooks/useLocale';
import { ATTENDEE_FIELDS } from '../../../constants';
import { useEnrolmentPageContext } from '../../../enrolmentPageContext/hooks/useEnrolmentPageContext';
import InWaitingListInfo from '../../../inWaitingListInfo/InWaitingListInfo';
import { AttendeeFields } from '../../../types';
import styles from './attendee.module.scss';

type Props = {
  attendee: AttendeeFields;
  attendeePath: string;
  formDisabled: boolean;
  index: number;
  onDelete: () => void;
  readOnly?: boolean;
  showDelete: boolean;
};

const getFieldName = (attendeePath: string, field: string) =>
  `${attendeePath}.${field}`;

const Attendee: React.FC<Props> = ({
  attendee,
  attendeePath,
  formDisabled,
  index,
  onDelete,
  readOnly,
  showDelete,
}) => {
  const { t } = useTranslation(['enrolment']);
  const locale = useLocale();
  const { openParticipant, toggleOpenParticipant } = useEnrolmentPageContext();

  return (
    <Accordion
      deleteButton={
        showDelete && !formDisabled ? (
          <button
            aria-label={t('buttonDeleteAttendee') as string}
            className={styles.deleteButton}
            onClick={onDelete}
            type="button"
          >
            <IconTrash />
          </button>
        ) : undefined
      }
      onClick={() => toggleOpenParticipant(index)}
      open={openParticipant === index}
      toggleButtonIcon={
        attendee.inWaitingList ? <InWaitingListInfo /> : undefined
      }
      toggleButtonLabel={
        attendee.name || t('attendeeDefaultTitle', { index: index + 1 })
      }
    >
      <Fieldset heading={t(`titleBasicInfo`)}>
        <FormGroup>
          <Field
            name={getFieldName(attendeePath, ATTENDEE_FIELDS.NAME)}
            component={TextInputField}
            disabled={formDisabled}
            label={t(`labelName`)}
            placeholder={readOnly ? '' : t(`placeholderName`)}
            readOnly={readOnly}
            required
          />
        </FormGroup>
        <FormGroup>
          <div
            className={classNames(styles.streetAddressRow, {
              [styles.readOnly]: readOnly,
            })}
          >
            <Field
              name={getFieldName(attendeePath, ATTENDEE_FIELDS.STREET_ADDRESS)}
              component={TextInputField}
              disabled={formDisabled}
              label={t(`labelStreetAddress`)}
              placeholder={readOnly ? '' : t(`placeholderStreetAddress`)}
              readOnly={readOnly}
              required
            />
            <Field
              name={getFieldName(attendeePath, ATTENDEE_FIELDS.DATE_OF_BIRTH)}
              disabled={formDisabled}
              label={t(`labelDateOfBirth`)}
              language={locale}
              placeholder={readOnly ? '' : t(`placeholderDateOfBirth`)}
              readOnly={readOnly}
              required
              {...(readOnly
                ? { component: TextInputField }
                : {
                    component: DateInputField,
                    maxDate: new Date(),
                    minDate: new Date(
                      `${new Date().getFullYear() - 100}-01-01`
                    ),
                  })}
            />
          </div>
        </FormGroup>
        <FormGroup>
          <div
            className={classNames(styles.zipRow, {
              [styles.readOnly]: readOnly,
            })}
          >
            <Field
              name={getFieldName(attendeePath, ATTENDEE_FIELDS.ZIP)}
              component={TextInputField}
              disabled={formDisabled}
              label={t(`labelZip`)}
              placeholder={readOnly ? '' : t(`placeholderZip`)}
              readOnly={readOnly}
              required
            />
            <Field
              name={getFieldName(attendeePath, ATTENDEE_FIELDS.CITY)}
              component={TextInputField}
              disabled={formDisabled}
              label={t(`labelCity`)}
              placeholder={readOnly ? '' : t(`placeholderCity`)}
              readOnly={readOnly}
              required
            />
          </div>
        </FormGroup>
        <Field
          name={getFieldName(attendeePath, ATTENDEE_FIELDS.EXTRA_INFO)}
          className={styles.extraInfoField}
          component={TextAreaField}
          disabled={formDisabled}
          label={t(`labelAttendeeExtraInfo`)}
          placeholder={readOnly ? '' : t(`placeholderAttendeeExtraInfo`)}
          readOnly={readOnly}
        />
      </Fieldset>
    </Accordion>
  );
};

export default Attendee;
