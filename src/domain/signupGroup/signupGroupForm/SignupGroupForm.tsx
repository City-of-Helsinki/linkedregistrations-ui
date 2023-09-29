/* eslint-disable max-len */
import { Field, Form, Formik } from 'formik';
import pick from 'lodash/pick';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
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
import Container from '../../app/layout/container/Container';
import { ROUTES } from '../../app/routes/constants';
import { Event } from '../../event/types';
import useLanguageOptions from '../../language/hooks/useLanguageOptions';
import { Registration } from '../../registration/types';
import { isRegistrationPossible } from '../../registration/utils';
import {
  getSeatsReservationData,
  isSeatsReservationExpired,
} from '../../reserveSeats/utils';
import {
  SIGNUP_ACTIONS,
  SIGNUP_MODALS,
  SIGNUP_QUERY_PARAMS,
} from '../../signup/constants';
import useSignupActions from '../../signup/hooks/useSignupActions';
import ConfirmDeleteSignupModal from '../../signup/modals/confirmDeleteSignupModal/ConfirmDeleteSignupModal';
import { useSignupServerErrorsContext } from '../../signup/signupServerErrorsContext/hooks/useSignupServerErrorsContext';
import { Signup } from '../../signup/types';
import ButtonWrapper from '../buttonWrapper/ButtonWrapper';
import {
  NOTIFICATIONS,
  READ_ONLY_PLACEHOLDER,
  SIGNUP_GROUP_ACTIONS,
  SIGNUP_GROUP_FIELDS,
} from '../constants';
import Divider from '../divider/Divider';
import EditButtonPanel from '../editButtonPanel/EditButtonPanel';
import EventInfo from '../eventInfo/EventInfo';
import FormContainer from '../formContainer/FormContainer';
import useNotificationOptions from '../hooks/useNotificationOptions';
import useSignupGroupActions from '../hooks/useSignupGroupActions';
import ParticipantAmountSelector from '../participantAmountSelector/ParticipantAmountSelector';
import ReservationTimer from '../reservationTimer/ReservationTimer';
import { useSignupGroupFormContext } from '../signupGroupFormContext/hooks/useSignupGroupFormContext';
import { SignupFields, SignupGroup, SignupGroupFormFields } from '../types';
import { isSignupFieldRequired } from '../utils';
import {
  getSignupGroupSchema,
  scrollToFirstError,
  showErrors,
} from '../validation';

import AvailableSeatsText from './availableSeatsText/AvailableSeatsText';
import styles from './signupGroupForm.module.scss';
import Signups from './signups/Signups';

const RegistrationWarning = dynamic(
  () => import('../registrationWarning/RegistrationWarning'),
  { ssr: false }
);

type Props = {
  event: Event;
  initialValues: SignupGroupFormFields;
  readOnly?: boolean;
  registration: Registration;
  signup?: Signup;
  signupGroup?: SignupGroup;
};

const SignupGroupForm: React.FC<Props> = ({
  event,
  initialValues,
  readOnly,
  registration,
  signup,
  signupGroup,
}) => {
  const { t } = useTranslation(['signup', 'common']);
  const { deleteSignup, saving: savingSignup } = useSignupActions({
    registration,
    signup,
  });
  const { deleteSignupGroup, saving: savingSignupGroup } =
    useSignupGroupActions({
      signupGroup,
    });
  const formSavingDisabled = React.useRef(!!readOnly);

  const reservationTimerCallbacksDisabled = React.useRef(false);
  const disableReservationTimerCallbacks = React.useCallback(() => {
    reservationTimerCallbacksDisabled.current = true;
  }, []);

  const { closeModal, openModal, setOpenModal, setOpenParticipant } =
    useSignupGroupFormContext();

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
    useSignupServerErrorsContext();

  const goToPage = (pathname: string) => {
    router.push({
      pathname,
      query: pick(query, [
        SIGNUP_QUERY_PARAMS.IFRAME,
        SIGNUP_QUERY_PARAMS.REDIRECT_URL,
      ]),
    });
  };
  const goToSignupGroupSummaryPage = () => {
    goToPage(
      `/${locale}${ROUTES.CREATE_SIGNUP_GROUP_SUMMARY.replace(
        '[registrationId]',
        registration.id
      )}`
    );
  };

  const goToSignupCancelledPage = () => {
    goToPage(
      `/${locale}${ROUTES.SIGNUP_CANCELLED.replace(
        '[registrationId]',
        registration.id
      )}`
    );
  };

  const goToSignupGroupCancelledPage = () => {
    goToPage(
      `/${locale}${ROUTES.SIGNUP_GROUP_CANCELLED.replace(
        '[registrationId]',
        registration.id
      )}`
    );
  };

  const handleDelete = async () => {
    setServerErrorItems([]);
    if (signupGroup) {
      await deleteSignupGroup({
        onError: (error) =>
          showServerErrors({ error: JSON.parse(error.message) }, 'signup'),
        onSuccess: goToSignupGroupCancelledPage,
      });
    } else {
      await deleteSignup({
        onError: (error) =>
          showServerErrors({ error: JSON.parse(error.message) }, 'signup'),
        onSuccess: goToSignupCancelledPage,
      });
    }
  };

  const isRestoringDisabled = () => {
    const data = getSeatsReservationData(registration.id);
    return !readOnly && (!data || isSeatsReservationExpired(data));
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={
        /* istanbul ignore next */
        () => undefined
      }
      validationSchema={
        readOnly ? undefined : () => getSignupGroupSchema(registration)
      }
    >
      {({ setErrors, setFieldValue, setTouched, values }) => {
        const clearErrors = () => setErrors({});

        const setSignups = (signups: SignupFields[]) => {
          setFieldValue(SIGNUP_GROUP_FIELDS.SIGNUPS, signups);
        };

        const handleSubmit = async () => {
          try {
            setServerErrorItems([]);
            clearErrors();

            await getSignupGroupSchema(registration).validate(values, {
              abortEarly: false,
            });

            goToSignupGroupSummaryPage();
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
            <ConfirmDeleteSignupModal
              isOpen={openModal === SIGNUP_MODALS.DELETE}
              isSaving={
                savingSignup === SIGNUP_ACTIONS.DELETE ||
                savingSignupGroup === SIGNUP_GROUP_ACTIONS.DELETE
              }
              onClose={closeModal}
              onDelete={handleDelete}
            />
            <Form noValidate>
              {!signup && !signupGroup && (
                <FormikPersist
                  isSessionStorage={true}
                  name={`${FORM_NAMES.CREATE_SIGNUP_GROUP_FORM}-${registration.id}`}
                  restoringDisabled={isRestoringDisabled()}
                  savingDisabled={formSavingDisabled.current}
                />
              )}

              <Container withOffset>
                <FormContainer>
                  <EventInfo event={event} registration={registration} />
                  <ServerErrorSummary errors={serverErrorItems} />
                  <RegistrationWarning registration={registration} />

                  {!signup && !signupGroup ? (
                    <>
                      {isRegistrationPossible(registration) && (
                        <>
                          <Divider />
                          <ReservationTimer
                            callbacksDisabled={
                              reservationTimerCallbacksDisabled.current
                            }
                            disableCallbacks={disableReservationTimerCallbacks}
                            initReservationData={true}
                            registration={registration}
                            setSignups={setSignups}
                            signups={values.signups}
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
                    </>
                  ) : (
                    <h2>{t('titleSignups')}</h2>
                  )}

                  <Signups
                    formDisabled={formDisabled}
                    readOnly={readOnly}
                    registration={registration}
                  />

                  <h2 className={styles.sectionTitle}>
                    {t('titleInformantInfo')}
                  </h2>
                  <Divider />

                  <Fieldset heading={t(`titleContactInfo`)}>
                    <FormGroup>
                      <div className={styles.emailRow}>
                        <Field
                          name={SIGNUP_GROUP_FIELDS.EMAIL}
                          component={TextInputField}
                          disabled={formDisabled}
                          label={t(`labelEmail`)}
                          placeholder={
                            readOnly
                              ? READ_ONLY_PLACEHOLDER
                              : t(`placeholderEmail`)
                          }
                          readOnly={readOnly}
                          required
                        />
                        <Field
                          name={SIGNUP_GROUP_FIELDS.PHONE_NUMBER}
                          component={PhoneInputField}
                          disabled={formDisabled}
                          label={t(`labelPhoneNumber`)}
                          placeholder={
                            readOnly
                              ? READ_ONLY_PLACEHOLDER
                              : t(`placeholderPhoneNumber`)
                          }
                          readOnly={readOnly}
                          required={
                            values.notifications.includes(NOTIFICATIONS.SMS) ||
                            isSignupFieldRequired(
                              registration,
                              SIGNUP_GROUP_FIELDS.PHONE_NUMBER
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
                        name={SIGNUP_GROUP_FIELDS.NOTIFICATIONS}
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
                          name={SIGNUP_GROUP_FIELDS.MEMBERSHIP_NUMBER}
                          component={TextInputField}
                          disabled={formDisabled}
                          label={t(`labelMembershipNumber`)}
                          placeholder={
                            readOnly
                              ? READ_ONLY_PLACEHOLDER
                              : t(`placeholderMembershipNumber`)
                          }
                          readOnly={readOnly}
                          required={isSignupFieldRequired(
                            registration,
                            SIGNUP_GROUP_FIELDS.MEMBERSHIP_NUMBER
                          )}
                        />
                      </div>
                    </FormGroup>
                    <FormGroup>
                      <div className={styles.nativeLanguageRow}>
                        <Field
                          component={SingleSelectField}
                          name={SIGNUP_GROUP_FIELDS.NATIVE_LANGUAGE}
                          disabled={formDisabled || readOnly}
                          label={t(`labelNativeLanguage`)}
                          options={languageOptions}
                          placeholder={
                            readOnly
                              ? READ_ONLY_PLACEHOLDER
                              : t(`placeholderNativeLanguage`)
                          }
                          readOnly={readOnly}
                          required
                        />
                        <Field
                          component={SingleSelectField}
                          name={SIGNUP_GROUP_FIELDS.SERVICE_LANGUAGE}
                          disabled={formDisabled || readOnly}
                          label={t(`labelServiceLanguage`)}
                          options={serviceLanguageOptions}
                          placeholder={
                            readOnly
                              ? READ_ONLY_PLACEHOLDER
                              : t(`placeholderServiceLanguage`)
                          }
                          required
                        />
                      </div>
                    </FormGroup>
                    {/* Don't show group extra info field when editing a single signup */}
                    {!signup && (
                      <FormGroup>
                        <Field
                          name={SIGNUP_GROUP_FIELDS.EXTRA_INFO}
                          component={TextAreaField}
                          disabled={formDisabled}
                          label={t(`labelExtraInfo`)}
                          placeholder={
                            readOnly
                              ? READ_ONLY_PLACEHOLDER
                              : t(`placeholderExtraInfo`)
                          }
                          readOnly={readOnly}
                          required={isSignupFieldRequired(
                            registration,
                            SIGNUP_GROUP_FIELDS.EXTRA_INFO
                          )}
                        />
                      </FormGroup>
                    )}
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
                                  url: t('linkDataProtectionNotice'),
                                }),
                              }}
                            />
                          }
                          name={SIGNUP_GROUP_FIELDS.ACCEPTED}
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
                </FormContainer>
              </Container>
              {readOnly && (
                <EditButtonPanel
                  disabled={formDisabled}
                  onDelete={() => setOpenModal(SIGNUP_MODALS.DELETE)}
                />
              )}
            </Form>
          </>
        );
      }}
    </Formik>
  );
};

export default SignupGroupForm;
