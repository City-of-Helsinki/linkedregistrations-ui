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
import { ENROLMENT_FIELDS } from '../../constants';
import { useEnrolmentServerErrorsContext } from '../../enrolmentServerErrorsContext/hooks/useEnrolmentServerErrorsContext';
import ConfirmDeleteParticipantModal from '../../modals/confirmDeleteParticipantModal/ConfirmDeleteParticipantModal';
import { AttendeeFields } from '../../types';
import { getNewAttendees } from '../../utils';
import Attendee from './attendee/Attendee';
import styles from './attendees.module.scss';

const getAttendeePath = (index: number) =>
  `${ENROLMENT_FIELDS.ATTENDEES}[${index}]`;

interface Props {
  formDisabled: boolean;
  readOnly?: boolean;
  registration: Registration;
}

const Attendees: React.FC<Props> = ({
  formDisabled,
  readOnly,
  registration,
}) => {
  const { data: session } = useSession() as { data: ExtendedSession | null };

  const indexToRemove = useRef(-1);
  const [openModalIndex, setOpenModalIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const { setServerErrorItems, showServerErrors } =
    useEnrolmentServerErrorsContext();

  const [{ value: attendees }, , { setValue: setAttendees }] = useField<
    AttendeeFields[]
  >({ name: ENROLMENT_FIELDS.ATTENDEES });

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
        const newAttendees = getNewAttendees({
          attendees: attendees.filter(
            (_, index) => index !== indexToRemove.current
          ),
          seatsReservation,
        });

        setAttendees(newAttendees);

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
        name={ENROLMENT_FIELDS.ATTENDEES}
        render={() => (
          <div>
            {attendees.map((attendee, index: number) => {
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

                await updateSeatsReservationMutation.mutate({
                  code: reservationData.code,
                  id: reservationData.id,
                  registration: registration.id,
                  seats: attendees.length - 1,
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
                  <Attendee
                    attendee={attendee}
                    attendeePath={getAttendeePath(index)}
                    formDisabled={formDisabled}
                    index={index}
                    onDelete={openModal}
                    readOnly={readOnly}
                    registration={registration}
                    showDelete={attendees.length > 1}
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

export default Attendees;
