/* eslint-disable max-len */
import { FieldArray, useField } from 'formik';
import React, { useState } from 'react';

import { reportError } from '../../../app/sentry/utils';
import { Registration } from '../../../registration/types';
import { useUpdateReserveSeatsMutation } from '../../../reserveSeats/mutation';
import {
  getSeatsReservationData,
  setSeatsReservationData,
} from '../../../reserveSeats/utils';
import { ENROLMENT_FIELDS } from '../../constants';
import { useEnrolmentServerErrorsContext } from '../../enrolmentServerErrorsContext/hooks/useEnrolmentServerErrorsContext';
import ConfirmDeleteParticipantModal from '../../modals/confirmDeleteParticipantModal/ConfirmDeleteParticipantModal';
import { AttendeeFields } from '../../types';
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
  const [openModalIndex, setOpenModalIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const { setServerErrorItems, showServerErrors } =
    useEnrolmentServerErrorsContext();

  const [{ value: attendees }] = useField<AttendeeFields[]>({
    name: ENROLMENT_FIELDS.ATTENDEES,
  });

  const closeModal = () => {
    setOpenModalIndex(null);
  };

  const updateReserveSeatsMutation = useUpdateReserveSeatsMutation({
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
    onSuccess: (data) => {
      // TODO: Update reservation from API when BE is ready
      setSeatsReservationData(registration.id, data);

      setSaving(false);
      closeModal();
    },
  });

  return (
    <div className={styles.accordions}>
      <FieldArray
        name={ENROLMENT_FIELDS.ATTENDEES}
        render={(arrayHelpers) => (
          <div>
            {attendees.map((attendee, index: number) => {
              const openModal = () => {
                setOpenModalIndex(index);
              };

              const deleteParticipant = async () => {
                setSaving(true);

                const data = getSeatsReservationData(registration.id);

                // Clear server errors
                setServerErrorItems([]);

                await updateReserveSeatsMutation.mutate({
                  code: data?.code as string,
                  registration: registration.id,
                  seats: attendees.length - 1,
                  waitlist: false,
                });
                arrayHelpers.remove(index);
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
                    key={index}
                    attendee={attendee}
                    attendeePath={getAttendeePath(index)}
                    formDisabled={formDisabled}
                    index={index}
                    onDelete={openModal}
                    readOnly={readOnly}
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
