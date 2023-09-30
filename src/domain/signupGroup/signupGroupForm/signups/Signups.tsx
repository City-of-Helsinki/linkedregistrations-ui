/* eslint-disable max-len */
import { FieldArray, useField } from 'formik';
import { useSession } from 'next-auth/react';
import React, { useRef, useState } from 'react';

import { ExtendedSession } from '../../../../types';
import { reportError } from '../../../app/sentry/utils';
import { Registration } from '../../../registration/types';
import { useUpdateSeatsReservationMutation } from '../../../reserveSeats/mutation';
import {
  getSeatsReservationData,
  setSeatsReservationData,
} from '../../../reserveSeats/utils';
import { useSignupServerErrorsContext } from '../../../signup/signupServerErrorsContext/hooks/useSignupServerErrorsContext';
import { SIGNUP_GROUP_FIELDS } from '../../constants';
import ConfirmDeleteParticipantModal from '../../modals/confirmDeleteSignupFromFormModal/ConfirmDeleteSignupFromFormModal';
import { SignupFields } from '../../types';
import { getNewSignups } from '../../utils';

import Signup from './signup/Signup';
import styles from './signups.module.scss';

const getSignupPath = (index: number) =>
  `${SIGNUP_GROUP_FIELDS.SIGNUPS}[${index}]`;

interface Props {
  formDisabled: boolean;
  isEditingMode: boolean;
  registration: Registration;
}

const Signups: React.FC<Props> = ({
  formDisabled,
  isEditingMode,
  registration,
}) => {
  const { data: session } = useSession() as { data: ExtendedSession | null };

  const indexToRemove = useRef(-1);
  const [openModalIndex, setOpenModalIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const { setServerErrorItems, showServerErrors } =
    useSignupServerErrorsContext();

  const [{ value: signups }, , { setValue: setSignups }] = useField<
    SignupFields[]
  >({ name: SIGNUP_GROUP_FIELDS.SIGNUPS });

  const closeModal = () => {
    setOpenModalIndex(null);
  };

  const updateSeatsReservationMutation = useUpdateSeatsReservationMutation({
    options: {
      onError: (error, variables) => {
        showServerErrors(
          { error: JSON.parse(error.message) },
          'seatsReservation'
        );

        reportError({
          data: {
            error: JSON.parse(error.message),
            payload: variables,
            payloadAsString: JSON.stringify(variables),
          },
          message: 'Failed to update reserve seats',
        });

        setSaving(false);
        closeModal();
      },
      onSuccess: (seatsReservation) => {
        const newSignups = getNewSignups({
          signups: signups.filter(
            (_, index) => index !== indexToRemove.current
          ),
          seatsReservation,
        });

        setSignups(newSignups);

        setSeatsReservationData(registration.id, seatsReservation);

        setSaving(false);
        closeModal();
      },
    },
    session,
  });

  return (
    <div className={styles.accordions}>
      <FieldArray
        name={SIGNUP_GROUP_FIELDS.SIGNUPS}
        render={() => (
          <div>
            {signups.map((signup, index: number) => {
              const openModal = () => {
                setOpenModalIndex(index);
              };

              const deleteParticipant = async () => {
                setSaving(true);

                const reservationData = getSeatsReservationData(
                  registration.id
                );

                /* istanbul ignore next */
                if (!reservationData) {
                  throw new Error(
                    'Reservation data is not stored to session storage'
                  );
                }

                // Clear server errors
                setServerErrorItems([]);

                indexToRemove.current = index;

                updateSeatsReservationMutation.mutate({
                  code: reservationData.code,
                  id: reservationData.id,
                  registration: registration.id,
                  seats: signups.length - 1,
                });
              };

              return (
                <React.Fragment key={index}>
                  <ConfirmDeleteParticipantModal
                    isOpen={openModalIndex === index}
                    isSaving={saving}
                    onClose={closeModal}
                    onDelete={deleteParticipant}
                    participantCount={1}
                  />
                  <Signup
                    formDisabled={formDisabled}
                    index={index}
                    onDelete={openModal}
                    registration={registration}
                    showDelete={!isEditingMode && signups.length > 1}
                    signup={signup}
                    signupPath={getSignupPath(index)}
                  />
                </React.Fragment>
              );
            })}
          </div>
        )}
      />
    </div>
  );
};

export default Signups;
