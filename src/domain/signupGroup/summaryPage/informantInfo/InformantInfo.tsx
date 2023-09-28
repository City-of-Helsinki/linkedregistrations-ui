import { useTranslation } from 'next-i18next';
import React, { FC } from 'react';

import Fieldset from '../../../../common/components/fieldset/Fieldset';
import FormGroup from '../../../../common/components/formGroup/FormGroup';
import TextArea from '../../../../common/components/textArea/TextArea';
import skipFalsyType from '../../../../utils/skipFalsyType';
import useLanguageOptions from '../../../language/hooks/useLanguageOptions';
import { SIGNUP_GROUP_FIELDS } from '../../constants';
import Divider from '../../divider/Divider';
import useNotificationOptions from '../../hooks/useNotificationOptions';
import { SignupGroupFormFields } from '../../types';
import ReadOnlyTextInput from '../readOnlyTextInput/ReadOnlyTextInput';

import styles from './informantInfo.module.scss';

type Props = {
  values: SignupGroupFormFields;
};

const InformantInfo: FC<Props> = ({ values }) => {
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
      <h2>{t('titleInformantInfo')}</h2>
      <Divider />
      <Fieldset heading={t(`titleContactInfo`)}>
        <FormGroup>
          <div className={styles.emailRow}>
            <ReadOnlyTextInput
              id={SIGNUP_GROUP_FIELDS.EMAIL}
              label={t(`labelEmail`)}
              value={getFieldText(values.email)}
            />
            <ReadOnlyTextInput
              id={SIGNUP_GROUP_FIELDS.PHONE_NUMBER}
              label={t(`labelPhoneNumber`)}
              value={getFieldText(values.phoneNumber)}
            />
          </div>
        </FormGroup>
      </Fieldset>

      <Fieldset heading={t(`titleNotifications`)}>
        <FormGroup>
          <ReadOnlyTextInput
            id={SIGNUP_GROUP_FIELDS.NOTIFICATIONS}
            label={t(`labelNotifications`)}
            value={getFieldText(getNotificationsText(values.notifications))}
          />
        </FormGroup>
      </Fieldset>

      <Fieldset heading={t(`titleAdditionalInfo`)}>
        <FormGroup>
          <div className={styles.membershipNumberRow}>
            <ReadOnlyTextInput
              id={SIGNUP_GROUP_FIELDS.MEMBERSHIP_NUMBER}
              label={t(`labelMembershipNumber`)}
              value={getFieldText(values.membershipNumber)}
            />
          </div>
        </FormGroup>
        <FormGroup>
          <div className={styles.nativeLanguageRow}>
            <ReadOnlyTextInput
              id={SIGNUP_GROUP_FIELDS.NATIVE_LANGUAGE}
              label={t(`labelNativeLanguage`)}
              value={getFieldText(getLanguageText(values.nativeLanguage))}
            />
            <ReadOnlyTextInput
              id={SIGNUP_GROUP_FIELDS.SERVICE_LANGUAGE}
              label={t(`labelServiceLanguage`)}
              value={getFieldText(getLanguageText(values.serviceLanguage))}
            />
          </div>
        </FormGroup>
        <TextArea
          className={styles.textArea}
          id={SIGNUP_GROUP_FIELDS.EXTRA_INFO}
          label={t(`labelExtraInfo`)}
          readOnly
          value={getFieldText(values.extraInfo)}
        />
      </Fieldset>
    </div>
  );
};

export default InformantInfo;
