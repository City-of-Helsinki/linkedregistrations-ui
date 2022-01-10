import { Field, Form, Formik } from 'formik';
import { Fieldset, IconCross, Notification } from 'hds-react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import React from 'react';
import { ValidationError } from 'yup';
import 'react-toastify/dist/ReactToastify.css';

import Button from '../../../common/components/button/Button';
import CheckboxField from '../../../common/components/formFields/CheckboxField';
import CheckboxGroupField from '../../../common/components/formFields/CheckboxGroupField';
import DateInputField from '../../../common/components/formFields/DateInputField';
import PhoneInputField from '../../../common/components/formFields/PhoneInputField';
import SingleSelectField from '../../../common/components/formFields/SingleSelectField';
import TextAreaField from '../../../common/components/formFields/TextAreaField';
import TextInputField from '../../../common/components/formFields/TextInputField';
import FormGroup from '../../../common/components/formGroup/FormGroup';
import ServerErrorSummary from '../../../common/components/serverErrorSummary/ServerErrorSummary';
import useLocale from '../../../hooks/useLocale';
import useMountedState from '../../../hooks/useMountedState';
import { ROUTES } from '../../app/routes/constants';
import { reportError } from '../../app/sentry/utils';
import { Registration } from '../../registration/types';
import { isRegistrationPossible } from '../../registration/utils';
import { ENROLMENT_FIELDS, NOTIFICATIONS } from '../constants';
import useEnrolmentServerErrors from '../hooks/useEnrolmentServerErrors';
import useLanguageOptions from '../hooks/useLanguageOptions';
import useNotificationOptions from '../hooks/useNotificationOptions';
import ConfirmCancelModal from '../modals/ConfirmCancelModal';
import {
  useCreateEnrolmentMutation,
  useDeleteEnrolmentMutation,
} from '../mutation';
import RegistrationWarning from '../registrationWarning/RegistrationWarning';
import { Enrolment, EnrolmentFormFields } from '../types';
import { getEnrolmentPayload } from '../utils';
import { enrolmentSchema, scrollToFirstError, showErrors } from '../validation';
import styles from './enrolmentForm.module.scss';

export enum ENROLMENT_MODALS {
  CANCEL = 'cancel',
}

interface Callbacks {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onError?: (error: any) => void;
  onSuccess?: () => void;
}

type Props = {
  cancellationCode?: string;
  initialValues: EnrolmentFormFields;
  readOnly?: boolean;
  registration: Registration;
};

const EnrolmentForm: React.FC<Props> = ({
  cancellationCode,
  initialValues,
  readOnly,
  registration,
}) => {
  const { t } = useTranslation(['enrolment', 'common']);

  const [openModal, setOpenModal] = useMountedState<ENROLMENT_MODALS | null>(
    null
  );

  const closeModal = () => {
    setOpenModal(null);
  };

  const cleanAfterUpdate = async (callbacks?: Callbacks) => {
    closeModal();
    // Call callback function if defined
    await (callbacks?.onSuccess && callbacks.onSuccess());
  };

  const notificationOptions = useNotificationOptions();
  const languageOptions = useLanguageOptions();
  const formDisabled = !isRegistrationPossible(registration);
  const locale = useLocale();
  const router = useRouter();

  const { serverErrorItems, setServerErrorItems, showServerErrors } =
    useEnrolmentServerErrors();

  const goToEnrolmentCompletedPage = (enrolment: Enrolment) => {
    router.push(
      `/${locale}${ROUTES.ENROLMENT_COMPLETED.replace(
        '[registrationId]',
        registration.id
      )
        .replace('[enrolmentId]', enrolment.id)
        .replace('[accessCode]', enrolment.cancellation_code as string)}`
    );
  };

  const goToEnrolmentCancelledPage = () => {
    router.push(
      `/${locale}${ROUTES.ENROLMENT_CANCELLED.replace(
        '[registrationId]',
        registration.id
      )}`
    );
  };

  const createEnrolmentMutation = useCreateEnrolmentMutation({
    onError: (error, variables) => {
      showServerErrors({ error: JSON.parse(error.message) });
      reportError({
        data: {
          error: JSON.parse(error.message),
          payload: variables,
          payloadAsString: JSON.stringify(variables),
        },
        message: 'Failed to create enrolment',
      });
    },
    onSuccess: (data) => {
      goToEnrolmentCompletedPage(data);
    },
  });

  const deleteEnrolmentMutation = useDeleteEnrolmentMutation({
    onError: (error, variables) => {
      closeModal();

      showServerErrors({ error: JSON.parse(error.message) });
      // Report error to Sentry
      reportError({
        data: {
          error: JSON.parse(error.message),
          cancellationCode: variables,
        },
        message: 'Failed to cancel enrolment',
      });
    },
    onSuccess: () => {
      cleanAfterUpdate({ onSuccess: () => goToEnrolmentCancelledPage() });
    },
  });

  const handleCancel = () => {
    setServerErrorItems([]);
    deleteEnrolmentMutation.mutate(cancellationCode as string);
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={/* istanbul ignore next */ () => undefined}
      validationSchema={readOnly ? undefined : enrolmentSchema}
    >
      {({ setErrors, setTouched, values }) => {
        const clearErrors = () => setErrors({});

        const handleSubmit = async () => {
          try {
            setServerErrorItems([]);
            clearErrors();

            await enrolmentSchema.validate(values, { abortEarly: false });
            const payload = getEnrolmentPayload(values, registration);

            createEnrolmentMutation.mutate(payload);
          } catch (error) {
            showErrors({
              error: error as ValidationError,
              setErrors,
              setTouched,
            });

            scrollToFirstError({ error: error as ValidationError });
          }
        };

        return (
          <>
            <ConfirmCancelModal
              isOpen={openModal === ENROLMENT_MODALS.CANCEL}
              onCancel={handleCancel}
              onClose={closeModal}
            />
            <Form noValidate>
              <ServerErrorSummary errors={serverErrorItems} />
              <RegistrationWarning registration={registration} />
              <Fieldset heading={t(`titleBasicInfo`)}>
                <FormGroup>
                  <Field
                    name={ENROLMENT_FIELDS.NAME}
                    component={TextInputField}
                    disabled={formDisabled}
                    label={t(`labelName`)}
                    placeholder={readOnly ? '' : t(`placeholderName`)}
                    readOnly={readOnly}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <div className={styles.streetAddressRow}>
                    <Field
                      name={ENROLMENT_FIELDS.STREET_ADDRESS}
                      component={TextInputField}
                      disabled={formDisabled}
                      label={t(`labelStreetAddress`)}
                      placeholder={
                        readOnly ? '' : t(`placeholderStreetAddress`)
                      }
                      readOnly={readOnly}
                      required
                    />
                    <Field
                      name={ENROLMENT_FIELDS.DATE_OF_BIRTH}
                      component={DateInputField}
                      disabled={formDisabled}
                      label={t(`labelDateOfBirth`)}
                      language={locale}
                      maxDate={new Date()}
                      minDate={
                        new Date(`${new Date().getFullYear() - 100}-01-01`)
                      }
                      placeholder={readOnly ? '' : t(`placeholderDateOfBirth`)}
                      readOnly={readOnly}
                      required
                    />
                  </div>
                </FormGroup>
                <FormGroup>
                  <div className={styles.zipRow}>
                    <Field
                      name={ENROLMENT_FIELDS.ZIP}
                      component={TextInputField}
                      disabled={formDisabled}
                      label={t(`labelZip`)}
                      placeholder={readOnly ? '' : t(`placeholderZip`)}
                      readOnly={readOnly}
                      required
                    />
                    <Field
                      name={ENROLMENT_FIELDS.CITY}
                      component={TextInputField}
                      disabled={formDisabled}
                      label={t(`labelCity`)}
                      placeholder={readOnly ? '' : t(`placeholderCity`)}
                      readOnly={readOnly}
                      required
                    />
                  </div>
                </FormGroup>
              </Fieldset>

              <Fieldset heading={t(`titleContactInfo`)}>
                <FormGroup>
                  <div className={styles.emailRow}>
                    <Field
                      name={ENROLMENT_FIELDS.EMAIL}
                      component={TextInputField}
                      disabled={formDisabled}
                      label={t(`labelEmail`)}
                      placeholder={readOnly ? '' : t(`placeholderEmail`)}
                      readOnly={readOnly}
                      required={values.notifications.includes(
                        NOTIFICATIONS.EMAIL
                      )}
                    />
                    <Field
                      name={ENROLMENT_FIELDS.PHONE_NUMBER}
                      component={PhoneInputField}
                      disabled={formDisabled}
                      label={t(`labelPhoneNumber`)}
                      placeholder={readOnly ? '' : t(`placeholderPhoneNumber`)}
                      readOnly={readOnly}
                      required={values.notifications.includes(
                        NOTIFICATIONS.SMS
                      )}
                      type="tel"
                    />
                  </div>
                </FormGroup>
              </Fieldset>

              <Fieldset heading={t(`titleNotifications`)}>
                <FormGroup>
                  <Field
                    name={ENROLMENT_FIELDS.NOTIFICATIONS}
                    className={styles.notifications}
                    component={CheckboxGroupField}
                    disabled={formDisabled || readOnly}
                    options={notificationOptions}
                  />
                </FormGroup>
              </Fieldset>

              <Fieldset heading={t(`titleAdditionalInfo`)}>
                <FormGroup>
                  <div className={styles.membershipNumberRow}>
                    <Field
                      name={ENROLMENT_FIELDS.MEMBERSHIP_NUMBER}
                      component={TextInputField}
                      disabled={formDisabled}
                      label={t(`labelMembershipNumber`)}
                      placeholder={
                        readOnly ? '' : t(`placeholderMembershipNumber`)
                      }
                      readOnly={readOnly}
                    />
                  </div>
                </FormGroup>
                <FormGroup>
                  <div className={styles.nativeLanguageRow}>
                    <Field
                      name={ENROLMENT_FIELDS.NATIVE_LANGUAGE}
                      component={SingleSelectField}
                      disabled={formDisabled || readOnly}
                      label={t(`labelNativeLanguage`)}
                      options={languageOptions}
                      placeholder={
                        readOnly ? '' : t(`placeholderNativeLanguage`)
                      }
                      readOnly={readOnly}
                      required
                    />
                    <Field
                      name={ENROLMENT_FIELDS.SERVICE_LANGUAGE}
                      component={SingleSelectField}
                      disabled={formDisabled || readOnly}
                      label={t(`labelServiceLanguage`)}
                      options={languageOptions}
                      placeholder={
                        readOnly ? '' : t(`placeholderServiceLanguage`)
                      }
                      required
                    />
                  </div>
                </FormGroup>
                <FormGroup>
                  <Field
                    name={ENROLMENT_FIELDS.EXTRA_INFO}
                    component={TextAreaField}
                    disabled={formDisabled}
                    label={t(`labelExtraInfo`)}
                    placeholder={readOnly ? '' : t(`placeholderExtraInfo`)}
                    readOnly={readOnly}
                  />
                </FormGroup>
              </Fieldset>
              {!readOnly && (
                <>
                  <FormGroup>
                    <Field
                      disabled={formDisabled}
                      label={t(`labelAccepted`)}
                      name={ENROLMENT_FIELDS.ACCEPTED}
                      component={CheckboxField}
                    />
                  </FormGroup>

                  <Notification
                    className={styles.notification}
                    label={t('notificationTitle')}
                  >
                    <div
                      dangerouslySetInnerHTML={{
                        __html: t('notificationLabel', {
                          openInNewTab: t('common:openInNewTab'),
                          url: t('linkPrivacyPolicy'),
                        }),
                      }}
                    ></div>
                  </Notification>
                  <div className={styles.buttonWrapper}>
                    <Button
                      className={styles.button}
                      disabled={formDisabled}
                      onClick={handleSubmit}
                    >
                      {t('buttonSend')}
                    </Button>
                  </div>
                </>
              )}
              {readOnly && (
                <div className={styles.buttonWrapper}>
                  <Button
                    className={styles.button}
                    disabled={formDisabled}
                    iconLeft={<IconCross aria-hidden={true} />}
                    onClick={() => setOpenModal(ENROLMENT_MODALS.CANCEL)}
                    variant={'danger'}
                  >
                    {t('buttonCancel')}
                  </Button>
                </div>
              )}
            </Form>
          </>
        );
      }}
    </Formik>
  );
};

export default EnrolmentForm;
