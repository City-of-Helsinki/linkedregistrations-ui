/* eslint-disable max-len */
import { useField } from 'formik';
import { useTranslation } from 'next-i18next';
import React, { useState } from 'react';

import Button from '../../../common/components/button/Button';
import NumberInput from '../../../common/components/numberInput/NumberInput';
import { Registration } from '../../registration/types';
import {
  getAttendeeCapacityError,
  getMaxSeatsAmount,
} from '../../registration/utils';
import { getSeatsReservationData } from '../../reserveSeats/utils';
import { SIGNUP_MODALS } from '../../signup/constants';
import useSeatsReservationActions from '../../signup/hooks/useSeatsReservationActions';
import { useSignupServerErrorsContext } from '../../signup/signupServerErrorsContext/hooks/useSignupServerErrorsContext';
import { SIGNUP_GROUP_FIELDS } from '../../signupGroup/constants';
import { SignupFormFields } from '../../signupGroup/types';
import ConfirmDeleteSignupFromForm from '../modals/confirmDeleteSignupFromFormModal/ConfirmDeleteSignupFromFormModal';
import { useSignupGroupFormContext } from '../signupGroupFormContext/hooks/useSignupGroupFormContext';

import styles from './participantAmountSelector.module.scss';

interface Props {
  disabled: boolean;
  registration: Registration;
}

const ParticipantAmountSelector: React.FC<Props> = ({
  disabled,
  registration,
}) => {
  const { t } = useTranslation(['signup', 'common']);

  const { closeModal, openModal, setOpenModal } = useSignupGroupFormContext();
  const { setServerErrorItems, showServerErrors } =
    useSignupServerErrorsContext();

  const [participantsToDelete, setParticipantsToDelete] = useState(0);

  const [{ value: signups }, , { setValue: setSignups }] = useField<
    SignupFormFields[]
  >({ name: SIGNUP_GROUP_FIELDS.SIGNUPS });

  const [participantAmount, setParticipantAmount] = useState(
    Math.max(getSeatsReservationData(registration.id)?.seats ?? 0, 1)
  );

  const handleParticipantAmountChange: React.ChangeEventHandler<
    HTMLInputElement
  > = (event) => {
    setParticipantAmount(Number(event.target.value));
  };

  const attendeeCapacityError = getAttendeeCapacityError(
    registration,
    participantAmount,
    t
  );

  const maxSeatAmount = getMaxSeatsAmount(registration);

  const { saving, updateSeatsReservation } = useSeatsReservationActions({
    registration,
    setSignups,
    signups,
  });

  const updateParticipantAmount = () => {
    /* istanbul ignore else */
    if (participantAmount !== signups.length) {
      setServerErrorItems([]);

      updateSeatsReservation(participantAmount, {
        onError: (error) => {
          showServerErrors(
            { error: JSON.parse(error.message) },
            'seatsReservation'
          );
        },
      });
    }
  };

  const openDeleteSignupFromFromModal = () => {
    setOpenModal(SIGNUP_MODALS.DELETE_SIGNUP_FROM_FORM);
  };

  const handleUpdateClick = () => {
    if (participantAmount < signups.length) {
      setParticipantsToDelete(signups.length - participantAmount);
      openDeleteSignupFromFromModal();
    } else {
      updateParticipantAmount();
    }
  };

  return (
    <>
      <ConfirmDeleteSignupFromForm
        isOpen={openModal === SIGNUP_MODALS.DELETE_SIGNUP_FROM_FORM}
        isSaving={saving}
        onClose={closeModal}
        onDelete={updateParticipantAmount}
        participantCount={participantsToDelete}
      />
      <div className={styles.participantAmountSelector}>
        <NumberInput
          id="participant-amount-field"
          minusStepButtonAriaLabel={
            t('common:numberInput.minusStepButtonAriaLabel') as string
          }
          plusStepButtonAriaLabel={
            t('common:numberInput.plusStepButtonAriaLabel') as string
          }
          disabled={disabled}
          errorText={attendeeCapacityError}
          invalid={!!attendeeCapacityError}
          label={t(`labelParticipantAmount`)}
          min={1}
          max={maxSeatAmount}
          onChange={handleParticipantAmountChange}
          required
          step={1}
          value={participantAmount}
        />
        <div className={styles.buttonWrapper}>
          <Button
            disabled={disabled || !!attendeeCapacityError}
            onClick={handleUpdateClick}
            type="button"
            variant="secondary"
          >
            {t(`buttonUpdateParticipantAmount`)}
          </Button>
        </div>
      </div>
    </>
  );
};

export default ParticipantAmountSelector;
