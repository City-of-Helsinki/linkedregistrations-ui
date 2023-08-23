import { Field, Form, Formik } from 'formik';
import { IconCross } from 'hds-react';
import pick from 'lodash/pick';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import React, { useMemo } from 'react';
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
import { ROUTES } from '../../app/routes/constants';
import { Registration } from '../../registration/types';
import { isRegistrationPossible } from '../../registration/utils';
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
import useEnrolmentActions from '../hooks/useEnrolmentActions';
import useLanguageOptions from '../hooks/useLanguageOptions';
import useNotificationOptions from '../hooks/useNotificationOptions';
import ConfirmCancelModal from '../modals/confirmCancelModal/ConfirmCancelModal';
import ParticipantAmountSelector from '../participantAmountSelector/ParticipantAmountSelector';
import ReservationTimer from '../reservationTimer/ReservationTimer';
import { AttendeeFields, Enrolment, EnrolmentFormFields } from '../types';
import { isEnrolmentFieldRequired } from '../utils';
import {
  getEnrolmentSchema,
  scrollToFirstError,
  showErrors,
} from '../validation';
import Attendees from './attendees/Attendees';
import AvailableSeatsText from './availableSeatsText/AvailableSeatsText';
import styles from './enrolmentForm.module.scss';

const RegistrationWarning = dynamic(
  () => import('../registrationWarning/RegistrationWarning'),
  { ssr: false }
);

type Props = {
  enrolment?: Enrolment;
  initialValues: EnrolmentFormFields;
  readOnly?: boolean;
  registration: Registration;
};

const EnrolmentForm: React.FC<Props> = ({
  enrolment,
  initialValues,
  readOnly,
  registration,
}) => {
  const { t } = useTranslation(['enrolment', 'common']);
  const { cancelEnrolment } = useEnrolmentActions({ enrolment, registration });
  const formSavingDisabled = React.useRef(!!readOnly);

  const reservationTimerCallbacksDisabled = React.useRef(false);
  const disableReservationTimerCallbacks = React.useCallback(() => {
    reservationTimerCallbacksDisabled.current = true;
  }, []);

  const { closeModal, openModal, setOpenModal, setOpenParticipant } =
    useEnrolmentPageContext();

  const notificationOptions = useNotificationOptions();
  const languageOptions = useLanguageOptions();
  const serviceLanguageOptions = useLanguageOptions({ serviceLanguage: true });

  const locale = useLocale();
  const router = useRouter();
  const { query } = router;

  const formDisabled = useMemo(() => {
    const data = getSeatsReservationData(registration.id);
    if (data && !isSeatsReservationExpired(data)) {
      return false;
    }

    return !isRegistrationPossible(registration);
  }, [registration]);

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

  const handleCancel = async () => {
    setServerErrorItems([]);
    await cancelEnrolment({
      onError: (error) =>
        showServerErrors({ error: JSON.parse(error.message) }, 'enrolment'),
      onSuccess: goToEnrolmentCancelledPage,
    });
  };

  const isRestoringDisabled = () => {
    const data = getSeatsReservationData(registration.id);
    return !readOnly && (!data || isSeatsReservationExpired(data));
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={/* istanbul ignore next */ () => undefined}
      validationSchema={
        readOnly ? undefined : () => getEnrolmentSchema(registration)
      }
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

            await getEnrolmentSchema(registration).validate(values, {
              abortEarly: false,
            });

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

              {isRegistrationPossible(registration) && !readOnly && (
                <>
                  <Divider />
                  <ReservationTimer
                    attendees={values.attendees}
                    callbacksDisabled={
                      reservationTimerCallbacksDisabled.current
                    }
                    disableCallbacks={disableReservationTimerCallbacks}
                    initReservationData={true}
                    registration={registration}
                    setAttendees={setAttendees}
                  />
                </>
              )}

              <Divider />
              <h2>{t('titleRegistration')}</h2>

              <AvailableSeatsText registration={registration} />
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
                      required
                    />
                    <Field
                      name={ENROLMENT_FIELDS.PHONE_NUMBER}
                      component={PhoneInputField}
                      disabled={formDisabled}
                      label={t(`labelPhoneNumber`)}
                      placeholder={readOnly ? '' : t(`placeholderPhoneNumber`)}
                      readOnly={readOnly}
                      required={
                        values.notifications.includes(NOTIFICATIONS.SMS) ||
                        isEnrolmentFieldRequired(
                          registration,
                          ENROLMENT_FIELDS.PHONE_NUMBER
                        )
                      }
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
                    // TODO: At the moment only email notifications are supported
                    disabled={true}
                    // disabled={formDisabled || readOnly}
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
                      required={isEnrolmentFieldRequired(
                        registration,
                        ENROLMENT_FIELDS.MEMBERSHIP_NUMBER
                      )}
                    />
                  </div>
                </FormGroup>
                <FormGroup>
                  <div className={styles.nativeLanguageRow}>
                    <Field
                      component={SingleSelectField}
                      name={ENROLMENT_FIELDS.NATIVE_LANGUAGE}
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
                      component={SingleSelectField}
                      name={ENROLMENT_FIELDS.SERVICE_LANGUAGE}
                      disabled={formDisabled || readOnly}
                      label={t(`labelServiceLanguage`)}
                      options={serviceLanguageOptions}
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
                    required={isEnrolmentFieldRequired(
                      registration,
                      ENROLMENT_FIELDS.EXTRA_INFO
                    )}
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
