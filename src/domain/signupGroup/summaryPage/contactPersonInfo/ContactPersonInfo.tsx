import { useTranslation } from 'next-i18next';
import React, { FC } from 'react';

import FormGroup from '../../../../common/components/formGroup/FormGroup';
import TextArea from '../../../../common/components/textArea/TextArea';
import skipFalsyType from '../../../../utils/skipFalsyType';
import useLanguageOptions from '../../../language/hooks/useLanguageOptions';
import { CONTACT_PERSON_FIELDS, SIGNUP_GROUP_FIELDS } from '../../constants';
import Divider from '../../divider/Divider';
import useNotificationOptions from '../../hooks/useNotificationOptions';
import { SignupGroupFormFields } from '../../types';
import ReadOnlyTextInput from '../readOnlyTextInput/ReadOnlyTextInput';

import styles from './contactPersonInfo.module.scss';

type Props = {
  values: SignupGroupFormFields;
};

const ContactPersonInfo: FC<Props> = ({
  values: { contactPerson, extraInfo },
}) => {
  const { t } = useTranslation('summary');
  const notificationOptions = useNotificationOptions();
  const languageOptions = useLanguageOptions();

  const getLanguageText = (value: string) =>
    languageOptions.find((o) => o.value === value)?.label;

  const getNotificationsText = (value: string[]) =>
    value
      .map((val) => notificationOptions.find((o) => o.value === val)?.label)
      .filter(skipFalsyType)
      .join(', ');

  const getFieldText = (value: string | undefined) => value || '-';

  return (
    <div>
      <h2>{t('contactPerson.titleContactPersonInfo')}</h2>
      <Divider />

      <FormGroup>
        <h3>{t(`contactPerson.titleContactInfo`)}</h3>
        <FormGroup>
          <div className={styles.emailRow}>
            <ReadOnlyTextInput
              id={CONTACT_PERSON_FIELDS.EMAIL}
              label={t(`contactPerson.labelEmail`)}
              value={getFieldText(contactPerson.email)}
            />
            <ReadOnlyTextInput
              id={CONTACT_PERSON_FIELDS.PHONE_NUMBER}
              label={t(`contactPerson.labelPhoneNumber`)}
              value={getFieldText(contactPerson.phoneNumber)}
            />
          </div>
        </FormGroup>
        <FormGroup>
          <div className={styles.nameRow}>
            <ReadOnlyTextInput
              id={CONTACT_PERSON_FIELDS.FIRST_NAME}
              label={t(`contactPerson.labelFirstName`)}
              value={getFieldText(contactPerson.firstName)}
            />
            <ReadOnlyTextInput
              id={CONTACT_PERSON_FIELDS.LAST_NAME}
              label={t(`contactPerson.labelLastName`)}
              value={getFieldText(contactPerson.lastName)}
            />
          </div>
        </FormGroup>
      </FormGroup>

      <FormGroup>
        <h3>{t(`contactPerson.titleNotifications`)}</h3>
        <ReadOnlyTextInput
          id={CONTACT_PERSON_FIELDS.NOTIFICATIONS}
          label={t(`contactPerson.labelNotifications`)}
          value={getFieldText(
            getNotificationsText(contactPerson.notifications)
          )}
        />
      </FormGroup>

      <FormGroup>
        <h3>{t(`contactPerson.titleAdditionalInfo`)}</h3>
        <FormGroup>
          <div className={styles.membershipNumberRow}>
            <ReadOnlyTextInput
              id={CONTACT_PERSON_FIELDS.MEMBERSHIP_NUMBER}
              label={t(`contactPerson.labelMembershipNumber`)}
              value={getFieldText(contactPerson.membershipNumber)}
            />
          </div>
        </FormGroup>
        <FormGroup>
          <div className={styles.nativeLanguageRow}>
            <ReadOnlyTextInput
              id={CONTACT_PERSON_FIELDS.NATIVE_LANGUAGE}
              label={t(`contactPerson.labelNativeLanguage`)}
              value={getFieldText(
                getLanguageText(contactPerson.nativeLanguage)
              )}
            />
            <ReadOnlyTextInput
              id={CONTACT_PERSON_FIELDS.SERVICE_LANGUAGE}
              label={t(`contactPerson.labelServiceLanguage`)}
              value={getFieldText(
                getLanguageText(contactPerson.serviceLanguage)
              )}
            />
          </div>
        </FormGroup>
        <TextArea
          className={styles.textArea}
          id={SIGNUP_GROUP_FIELDS.EXTRA_INFO}
          label={t(`labelExtraInfo`)}
          readOnly
          value={getFieldText(extraInfo)}
        />
      </FormGroup>
    </div>
  );
};

export default ContactPersonInfo;
