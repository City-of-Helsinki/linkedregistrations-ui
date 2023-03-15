import { Field, FieldAttributes, Form, Formik } from 'formik';
import { IconCross, SingleSelectProps } from 'hds-react';
import pick from 'lodash/pick';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import React from 'react';
import { ValidationError } from 'yup';
import 'react-toastify/dist/ReactToastify.css';

import Button from '../../../common/components/button/Button';
import Fieldset from '../../../common/components/fieldset/Fieldset';
import CheckboxField from '../../../common/components/formFields/CheckboxField';
import CheckboxGroupField from '../../../common/components/formFields/CheckboxGroupField';
import PhoneInputField from '../../../common/components/formFields/PhoneInputField';
import SingleSelectField from '../../../common/components/formFields/SingleSelectField';
import TextAreaField from '../../../common/components/formFields/TextAreaField';
import TextInputField from '../../../common/components/formFields/TextInputField';
import FormGroup from '../../../common/components/formGroup/FormGroup';
import FormikPersist from '../../../common/components/formikPersist/FormikPersist';
import ServerErrorSummary from '../../../common/components/serverErrorSummary/ServerErrorSummary';
import { FORM_NAMES } from '../../../constants';
import useLocale from '../../../hooks/useLocale';
import { ExtendedSession, OptionType } from '../../../types';
import { ROUTES } from '../../app/routes/constants';
import { reportError } from '../../app/sentry/utils';
import { Registration } from '../../registration/types';
import {
  getFreeAttendeeCapacity,
  isRegistrationPossible,
} from '../../registration/utils';
import {
  getSeatsReservationData,
  isSeatsReservationExpired,
} from '../../reserveSeats/utils';
import ButtonWrapper from '../buttonWrapper/ButtonWrapper';
import {
  ENROLMENT_FIELDS,
  ENROLMENT_MODALS,
  ENROLMENT_QUERY_PARAMS,
  NOTIFICATIONS,
} from '../constants';
import Divider from '../divider/Divider';
import { useEnrolmentPageContext } from '../enrolmentPageContext/hooks/useEnrolmentPageContext';
import { useEnrolmentServerErrorsContext } from '../enrolmentServerErrorsContext/hooks/useEnrolmentServerErrorsContext';
import useLanguageOptions from '../hooks/useLanguageOptions';
import useNotificationOptions from '../hooks/useNotificationOptions';
import ConfirmCancelModal from '../modals/confirmCancelModal/ConfirmCancelModal';
import { useDeleteEnrolmentMutation } from '../mutation';
import ParticipantAmountSelector from '../participantAmountSelector/ParticipantAmountSelector';
import RegistrationWarning from '../registrationWarning/RegistrationWarning';
import ReservationTimer from '../reservationTimer/ReservationTimer';
import { ReservationTimerProvider } from '../reservationTimer/ReservationTimerContext';
import { AttendeeFields, EnrolmentFormFields } from '../types';
import { enrolmentSchema, scrollToFirstError, showErrors } from '../validation';
import Attendees from './attendees/Attendees';
import styles from './enrolmentForm.module.scss';

interface Callbacks {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onError?: (error: any) => void;
  onSuccess?: () => void;
}

const LanguageField = (
  props: FieldAttributes<Omit<SingleSelectProps<OptionType>, 'options'>>
) => {
  const languageOptions = useLanguageOptions();

  return (
    <Field {...props} component={SingleSelectField} options={languageOptions} />
  );
};

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
  const { data: session } = useSession() as { data: ExtendedSession | null };

  const formSavingDisabled = React.useRef(!!readOnly);

  const { openModal, setOpenModal, setOpenParticipant } =
    useEnrolmentPageContext();

  const closeModal = () => {
    setOpenModal(null);
  };

  const cleanAfterUpdate = async (callbacks?: Callbacks) => {
    closeModal();
    // Call callback function if defined
    await (callbacks?.onSuccess && callbacks.onSuccess());
  };

  const freeCapacity = getFreeAttendeeCapacity(registration);
  const notificationOptions = useNotificationOptions();
  const formDisabled = !isRegistrationPossible(registration);
  const locale = useLocale();
  const router = useRouter();
  const { query } = router;

  const { serverErrorItems, setServerErrorItems, showServerErrors } =
    useEnrolmentServerErrorsContext();

  const goToPage = (pathname: string) => {
    router.push({
      pathname,
      query: pick(query, [
        ENROLMENT_QUERY_PARAMS.IFRAME,
        ENROLMENT_QUERY_PARAMS.REDIRECT_URL,
      ]),
    });
  };
  const goToEnrolmentSummaryPage = () => {
    goToPage(
      `/${locale}${ROUTES.CREATE_ENROLMENT_SUMMARY.replace(
        '[registrationId]',
        registration.id
      )}`
    );
  };

  const goToEnrolmentCancelledPage = () => {
    goToPage(
      `/${locale}${ROUTES.ENROLMENT_CANCELLED.replace(
        '[registrationId]',
        registration.id
      )}`
    );
  };

  const deleteEnrolmentMutation = useDeleteEnrolmentMutation({
    options: {
      onError: (error, variables) => {
        closeModal();

        showServerErrors({ error: JSON.parse(error.message) }, 'enrolment');
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
    },
    session,
  });

  const handleCancel = () => {
    setServerErrorItems([]);
    deleteEnrolmentMutation.mutate(cancellationCode as string);
  };

  const isRestoringDisabled = () => {
    const data = getSeatsReservationData(registration.id);
    return !readOnly && (!data || isSeatsReservationExpired(data));
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={/* istanbul ignore next */ () => undefined}
      validationSchema={readOnly ? undefined : enrolmentSchema}
    >
      {({ setErrors, setFieldValue, setTouched, values }) => {
        const clearErrors = () => setErrors({});

        const setAttendees = (attendees: AttendeeFields[]) => {
          setFieldValue(ENROLMENT_FIELDS.ATTENDEES, attendees);
        };

        const handleSubmit = async () => {
          try {
            setServerErrorItems([]);
            clearErrors();

            await enrolmentSchema.validate(values, { abortEarly: false });

            goToEnrolmentSummaryPage();
          } catch (error) {
            showErrors({
              error: error as ValidationError,
              setErrors,
              setTouched,
            });

            scrollToFirstError({
              error: error as ValidationError,
              setOpenAccordion: setOpenParticipant,
            });
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
              <FormikPersist
                isSessionStorage={true}
                name={`${FORM_NAMES.CREATE_ENROLMENT_FORM}-${registration.id}`}
                restoringDisabled={isRestoringDisabled()}
                savingDisabled={formSavingDisabled.current}
              />

              <ServerErrorSummary errors={serverErrorItems} />
              <RegistrationWarning registration={registration} />

              {!readOnly && (
                <ReservationTimerProvider
                  attendees={values.attendees}
                  initializeReservationData={true}
                  registration={registration}
                  setAttendees={setAttendees}
                >
                  <Divider />
                  <ReservationTimer />
                </ReservationTimerProvider>
              )}

              <Divider />
              <h2>{t('titleRegistration')}</h2>

              {typeof freeCapacity === 'number' && (
                <p>
                  {t('freeCapacity')} <strong>{freeCapacity}</strong>
                </p>
              )}
              <ParticipantAmountSelector
                disabled={formDisabled || !!readOnly}
                registration={registration}
              />

              <Attendees
                formDisabled={formDisabled}
                readOnly={readOnly}
                registration={registration}
              />

              <h2 className={styles.sectionTitle}>{t('titleInformantInfo')}</h2>
              <Divider />

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
                    label={t(`titleNotifications`)}
                    options={notificationOptions}
                    required
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
                    <LanguageField
                      name={ENROLMENT_FIELDS.NATIVE_LANGUAGE}
                      disabled={formDisabled || readOnly}
                      label={t(`labelNativeLanguage`)}
                      placeholder={
                        readOnly
                          ? ''
                          : (t(`placeholderNativeLanguage`) as string)
                      }
                      readOnly={readOnly}
                      required
                    />
                    <LanguageField
                      name={ENROLMENT_FIELDS.SERVICE_LANGUAGE}
                      disabled={formDisabled || readOnly}
                      label={t(`labelServiceLanguage`)}
                      placeholder={
                        readOnly
                          ? ''
                          : (t(`placeholderServiceLanguage`) as string)
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
                      label={
                        <span
                          dangerouslySetInnerHTML={{
                            __html: t('labelAccepted', {
                              openInNewTab: t('common:openInNewTab'),
                              url: t('linkPrivacyPolicy'),
                            }),
                          }}
                        />
                      }
                      name={ENROLMENT_FIELDS.ACCEPTED}
                      component={CheckboxField}
                    />
                  </FormGroup>

                  <ButtonWrapper>
                    <Button disabled={formDisabled} onClick={handleSubmit}>
                      {t('buttonGoToSummary')}
                    </Button>
                  </ButtonWrapper>
                </>
              )}
              {readOnly && (
                <ButtonWrapper>
                  <Button
                    disabled={formDisabled}
                    iconLeft={<IconCross aria-hidden={true} />}
                    onClick={() => setOpenModal(ENROLMENT_MODALS.CANCEL)}
                    variant={'danger'}
                  >
                    {t('buttonCancel')}
                  </Button>
                </ButtonWrapper>
              )}
            </Form>
          </>
        );
      }}
    </Formik>
  );
};

export default EnrolmentForm;
