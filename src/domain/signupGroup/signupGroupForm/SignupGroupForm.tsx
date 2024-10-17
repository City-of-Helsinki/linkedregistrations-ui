/* eslint-disable max-len */
import { Field, Form, Formik } from 'formik';
import pick from 'lodash/pick';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React, { useMemo } from 'react';
import { ValidationError } from 'yup';

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
import Notification from '../../../common/components/notification/Notification';
import { useNotificationsContext } from '../../../common/components/notificationsContext/hooks/useNotificationsContext';
import ServerErrorSummary from '../../../common/components/serverErrorSummary/ServerErrorSummary';
import { FORM_NAMES, READ_ONLY_PLACEHOLDER } from '../../../constants';
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
import { SIGNUP_MODALS, SIGNUP_QUERY_PARAMS } from '../../signup/constants';
import useSignupActions from '../../signup/hooks/useSignupActions';
import ConfirmDeleteSignupModal from '../../signup/modals/confirmDeleteSignupModal/ConfirmDeleteSignupModal';
import { useSignupServerErrorsContext } from '../../signup/signupServerErrorsContext/hooks/useSignupServerErrorsContext';
import { Signup } from '../../signup/types';
import {
  canCancelSignup,
  canEditSignup,
  getCancelSignupWarning,
  getEditSignupWarning,
} from '../../signup/utils';
import ButtonWrapper from '../buttonWrapper/ButtonWrapper';
import {
  CONTACT_PERSON_FIELDS,
  SIGNUP_GROUP_ACTIONS,
  SIGNUP_GROUP_FIELDS,
} from '../constants';
import Divider from '../divider/Divider';
import EditButtonPanel from '../editButtonPanel/EditButtonPanel';
import EventInfo from '../eventInfo/EventInfo';
import FormContainer from '../formContainer/FormContainer';
import useNotificationOptions from '../hooks/useNotificationOptions';
import useSignupGroupActions from '../hooks/useSignupGroupActions';
import useSignupPriceGroupOptions from '../hooks/useSignupPriceGroupOptions';
import ParticipantAmountSelector from '../participantAmountSelector/ParticipantAmountSelector';
import ReservationTimer from '../reservationTimer/ReservationTimer';
import { useSignupGroupFormContext } from '../signupGroupFormContext/hooks/useSignupGroupFormContext';
import { SignupFormFields, SignupGroup, SignupGroupFormFields } from '../types';
import {
  canCancelSignupGroup,
  canEditSignupGroup,
  getCancelSignupGroupWarning,
  getContactPersonFieldName,
  getEditSignupGroupWarning,
  isSignupFieldRequired,
  shouldCreatePayment,
} from '../utils';
import {
  getSignupGroupSchema,
  scrollToFirstError,
  showErrors,
} from '../validation';

import AvailableSeatsText from './availableSeatsText/AvailableSeatsText';
import CannotEditContactPersonNotification from './cannotEditContactPersonNotification/CannotEditContactPersonNotification';
import styles from './signupGroupForm.module.scss';
import Signups from './signups/Signups';

const RegistrationWarning = dynamic(
  () => import('../registrationWarning/RegistrationWarning'),
  { ssr: false }
);

type Props = {
  contactPersonFieldsDisabled?: boolean;
  event: Event;
  initialValues: SignupGroupFormFields;
  mode: 'create-signup-group' | 'update-signup' | 'update-signup-group';
  registration: Registration;
  signup?: Signup;
  signupGroup?: SignupGroup;
};

const SignupGroupForm: React.FC<Props> = ({
  contactPersonFieldsDisabled,
  event,
  initialValues,
  mode,
  registration,
  signup,
  signupGroup,
}) => {
  const { t } = useTranslation(['signup', 'common']);

  const isEditingMode =
    mode === 'update-signup' || mode === 'update-signup-group';
  const { allowToEdit, allowToCancel, cancelWarning, editWarning } =
    useMemo((): {
      allowToCancel: boolean;
      allowToEdit: boolean;
      cancelWarning: string;
      editWarning: string;
    } => {
      if (mode === 'update-signup' && signup) {
        return {
          allowToCancel: canCancelSignup({ event, signup, signupGroup }),
          allowToEdit: canEditSignup(signup, signupGroup),
          cancelWarning: getCancelSignupWarning({
            event,
            signup,
            signupGroup,
            t,
          }),
          editWarning: getEditSignupWarning({ signup, signupGroup, t }),
        };
      } else if (mode === 'update-signup-group' && signupGroup) {
        return {
          allowToCancel: canCancelSignupGroup({ event, signupGroup }),
          allowToEdit: canEditSignupGroup(signupGroup),
          cancelWarning: getCancelSignupGroupWarning({ event, signupGroup, t }),
          editWarning: getEditSignupGroupWarning({ signupGroup, t }),
        };
      }
      return {
        allowToCancel: false,
        allowToEdit: true,
        cancelWarning: '',
        editWarning: '',
      };
    }, [event, mode, signup, signupGroup, t]);

  const readOnly = !allowToEdit;

  const titleCannotEditContactPerson = contactPersonFieldsDisabled
    ? t('signup:titleCannotEditContactPerson')
    : undefined;

  const priceGroupOptions = useSignupPriceGroupOptions(registration);

  const {
    deleteSignup,
    saving: savingSignup,
    updateSignup,
  } = useSignupActions({
    registration,
    signup,
  });
  const {
    deleteSignupGroup,
    saving: savingSignupGroup,
    updateSignupGroup,
  } = useSignupGroupActions({
    registration,
    signupGroup,
  });
  const formSavingDisabled = React.useRef(isEditingMode);

  const { addNotification } = useNotificationsContext();

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

  const handleUpdate = (values: SignupGroupFormFields) => {
    if (signupGroup) {
      updateSignupGroup(values, {
        onError: (error) =>
          showServerErrors({ error: JSON.parse(error.message) }, 'signup'),
        onSuccess: () => {
          window.scrollTo(0, 0);
          addNotification({
            type: 'success',
            label: t('signup:notificationSignupGroupUpdated'),
          });
        },
      });
    } else {
      updateSignup(values, {
        onError: (error) =>
          showServerErrors({ error: JSON.parse(error.message) }, 'signup'),
        onSuccess: () => {
          window.scrollTo(0, 0);
          addNotification({
            type: 'success',
            label: t('signup:notificationSignupUpdated'),
          });
        },
      });
    }
  };

  const isRestoringDisabled = () => {
    const data = getSeatsReservationData(registration.id);
    return !isEditingMode && (!data || isSeatsReservationExpired(data));
  };

  const getPlaceholder = (placeholder: string) =>
    readOnly ? READ_ONLY_PLACEHOLDER : placeholder;

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={
        /* istanbul ignore next */
        () => undefined
      }
      validationSchema={
        readOnly
          ? undefined
          : getSignupGroupSchema(registration, !contactPersonFieldsDisabled)
      }
    >
      {({ setErrors, setFieldValue, setTouched, values }) => {
        const createPayment = shouldCreatePayment(
          priceGroupOptions,
          values.signups
        );

        const clearErrors = () => setErrors({});

        const setSignups = (signups: SignupFormFields[]) => {
          setFieldValue(SIGNUP_GROUP_FIELDS.SIGNUPS, signups);
        };

        const handleSubmit = async () => {
          try {
            setServerErrorItems([]);
            clearErrors();

            await getSignupGroupSchema(
              registration,
              !contactPersonFieldsDisabled
            ).validate(values, {
              abortEarly: false,
            });

            if (signup || signupGroup) {
              handleUpdate(values);
            } else {
              goToSignupGroupSummaryPage();
            }
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
              isSaving={savingSignupGroup === SIGNUP_GROUP_ACTIONS.DELETE}
              onDelete={handleDelete}
              onClose={closeModal}
            />
            <Form noValidate>
              {!isEditingMode && (
                <FormikPersist
                  isSessionStorage={true}
                  name={`${FORM_NAMES.CREATE_SIGNUP_GROUP_FORM}-${registration.id}`}
                  restoringDisabled={isRestoringDisabled()}
                  savingDisabled={formSavingDisabled.current}
                />
              )}
              <Container withOffset>
                <FormContainer>
                  <RegistrationWarning registration={registration} />
                  <EventInfo event={event} registration={registration} />
                  <ServerErrorSummary errors={serverErrorItems} />

                  {!isEditingMode && (
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
                        disabled={formDisabled || readOnly}
                        registration={registration}
                      />
                    </>
                  )}

                  {isEditingMode && <h2>{t('signup.titleSignups')}</h2>}
                  <Signups
                    formDisabled={formDisabled}
                    isEditingMode={isEditingMode}
                    readOnly={readOnly}
                    registration={registration}
                  />

                  <FormGroup>
                    <h2 className={styles.sectionTitle}>
                      {t('contactPerson.titleContactPersonInfo')}
                    </h2>
                  </FormGroup>
                  <Notification type="info">
                    <p style={{ margin: 0 }}>
                      {t('contactPerson.notificationTextContactPersonInfo')}
                    </p>
                  </Notification>
                  <Divider />

                  {contactPersonFieldsDisabled && signup && (
                    <CannotEditContactPersonNotification signup={signup} />
                  )}
                  <Fieldset heading={t(`contactPerson.titleContactInfo`)}>
                    <FormGroup>
                      <div className={styles.emailRow}>
                        <Field
                          name={getContactPersonFieldName(
                            CONTACT_PERSON_FIELDS.EMAIL
                          )}
                          component={TextInputField}
                          disabled={formDisabled || contactPersonFieldsDisabled}
                          label={t(`contactPerson.labelEmail`)}
                          placeholder={getPlaceholder(
                            t(`contactPerson.placeholderEmail`)
                          )}
                          readOnly={readOnly}
                          required
                          title={titleCannotEditContactPerson}
                          type="email"
                        />
                        <Field
                          name={getContactPersonFieldName(
                            CONTACT_PERSON_FIELDS.PHONE_NUMBER
                          )}
                          component={PhoneInputField}
                          disabled={formDisabled || contactPersonFieldsDisabled}
                          label={t(`contactPerson.labelPhoneNumber`)}
                          placeholder={getPlaceholder(
                            t(`contactPerson.placeholderPhoneNumber`)
                          )}
                          readOnly={readOnly}
                          title={titleCannotEditContactPerson}
                          type="tel"
                        />
                      </div>
                    </FormGroup>
                    <FormGroup>
                      <div className={styles.nameRow}>
                        <Field
                          name={getContactPersonFieldName(
                            CONTACT_PERSON_FIELDS.FIRST_NAME
                          )}
                          component={TextInputField}
                          disabled={formDisabled || contactPersonFieldsDisabled}
                          label={t(`contactPerson.labelFirstName`)}
                          placeholder={getPlaceholder(
                            t(`contactPerson.placeholderFirstName`)
                          )}
                          readOnly={readOnly}
                          required={createPayment}
                          title={titleCannotEditContactPerson}
                        />
                        <Field
                          name={getContactPersonFieldName(
                            CONTACT_PERSON_FIELDS.LAST_NAME
                          )}
                          component={TextInputField}
                          disabled={formDisabled || contactPersonFieldsDisabled}
                          label={t(`contactPerson.labelLastName`)}
                          placeholder={getPlaceholder(
                            t(`contactPerson.placeholderLastName`)
                          )}
                          readOnly={readOnly}
                          required={createPayment}
                          title={titleCannotEditContactPerson}
                        />
                      </div>
                    </FormGroup>
                  </Fieldset>

                  <FormGroup>
                    <h3 className={styles.formGroupTitle}>
                      {t(`contactPerson.titleNotifications`)}
                    </h3>
                    <Field
                      name={getContactPersonFieldName(
                        CONTACT_PERSON_FIELDS.NOTIFICATIONS
                      )}
                      className={styles.notifications}
                      component={CheckboxGroupField}
                      disabled={true}
                      label={getPlaceholder(
                        t(`contactPerson.titleNotifications`)
                      )}
                      options={notificationOptions}
                      required
                      title={titleCannotEditContactPerson}
                    />
                  </FormGroup>

                  <Fieldset heading={t(`contactPerson.titleAdditionalInfo`)}>
                    <FormGroup>
                      <div className={styles.membershipNumberRow}>
                        <Field
                          name={getContactPersonFieldName(
                            CONTACT_PERSON_FIELDS.MEMBERSHIP_NUMBER
                          )}
                          component={TextInputField}
                          disabled={formDisabled || contactPersonFieldsDisabled}
                          label={t(`contactPerson.labelMembershipNumber`)}
                          placeholder={getPlaceholder(
                            t(`contactPerson.placeholderMembershipNumber`)
                          )}
                          readOnly={readOnly}
                          title={titleCannotEditContactPerson}
                        />
                      </div>
                    </FormGroup>
                    <FormGroup>
                      <div className={styles.nativeLanguageRow}>
                        <Field
                          clearable
                          component={SingleSelectField}
                          name={getContactPersonFieldName(
                            CONTACT_PERSON_FIELDS.NATIVE_LANGUAGE
                          )}
                          disabled={
                            formDisabled ||
                            contactPersonFieldsDisabled ||
                            readOnly
                          }
                          label={t(`contactPerson.labelNativeLanguage`)}
                          options={languageOptions}
                          placeholder={getPlaceholder(
                            t(`contactPerson.placeholderNativeLanguage`)
                          )}
                          title={titleCannotEditContactPerson}
                          clearButtonAriaLabel={t('common:clearAllSelections')}
                        />
                        <Field
                          component={SingleSelectField}
                          name={getContactPersonFieldName(
                            CONTACT_PERSON_FIELDS.SERVICE_LANGUAGE
                          )}
                          disabled={
                            formDisabled ||
                            contactPersonFieldsDisabled ||
                            readOnly
                          }
                          label={t(`contactPerson.labelServiceLanguage`)}
                          options={serviceLanguageOptions}
                          placeholder={getPlaceholder(
                            t(`contactPerson.placeholderServiceLanguage`)
                          )}
                          required
                          title={titleCannotEditContactPerson}
                        />
                      </div>
                    </FormGroup>
                    {/* Don't show group extra info field when editing a single signup */}
                    {((!signup && !!signupGroup) ||
                      (!isEditingMode && values.signups.length > 1)) && (
                      <FormGroup>
                        <Field
                          name={SIGNUP_GROUP_FIELDS.EXTRA_INFO}
                          component={TextAreaField}
                          disabled={formDisabled}
                          label={t(`labelExtraInfo`)}
                          placeholder={getPlaceholder(
                            t(`placeholderExtraInfo`)
                          )}
                          readOnly={readOnly}
                          required={isSignupFieldRequired(
                            registration,
                            SIGNUP_GROUP_FIELDS.EXTRA_INFO
                          )}
                        />
                      </FormGroup>
                    )}
                  </Fieldset>

                  {!initialValues.userConsent && (
                    <>
                      <FormGroup>
                        <Field
                          disabled={formDisabled || readOnly}
                          label={
                            <span
                              dangerouslySetInnerHTML={{
                                __html: t('labelUserConsent', {
                                  openInNewTab: t('common:openInNewTab'),
                                  url: t('linkDataProtectionNotice'),
                                }),
                              }}
                            />
                          }
                          name={SIGNUP_GROUP_FIELDS.USER_CONSENT}
                          component={CheckboxField}
                        />
                      </FormGroup>

                      {!isEditingMode && (
                        <ButtonWrapper>
                          <Button
                            disabled={formDisabled || readOnly}
                            onClick={handleSubmit}
                          >
                            {t('buttonGoToSummary')}
                          </Button>
                        </ButtonWrapper>
                      )}
                    </>
                  )}
                </FormContainer>
              </Container>

              {isEditingMode && (
                <EditButtonPanel
                  allowToCancel={allowToCancel}
                  allowToEdit={allowToEdit}
                  cancelWarning={cancelWarning}
                  disabled={formDisabled || readOnly}
                  editWarning={editWarning}
                  onCancel={() => setOpenModal(SIGNUP_MODALS.DELETE)}
                  onUpdate={handleSubmit}
                  savingSignup={savingSignup}
                  savingSignupGroup={savingSignupGroup}
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
