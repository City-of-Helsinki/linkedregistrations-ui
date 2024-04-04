import { useQueryClient } from '@tanstack/react-query';
import orderBy from 'lodash/orderBy';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import React, { useState } from 'react';

import Checkbox from '../../../common/components/checkbox/Checkbox';
import { useNotificationsContext } from '../../../common/components/notificationsContext/hooks/useNotificationsContext';
import SearchStatus from '../../../common/components/searchStatus/SearchStatus';
import useHandleError from '../../../hooks/useHandleError';
import { ExtendedSession } from '../../../types';
import skipFalsyType from '../../../utils/skipFalsyType';
import { Registration } from '../../registration/types';
import { ATTENDEE_STATUS, PRESENCE_STATUS } from '../../signup/constants';
import { usePatchSignupMutation } from '../../signup/mutation';
import { PatchSignupMutationInput, Signup } from '../../signup/types';
import { getSignupFields } from '../../signup/utils';
import SearchRow from '../searchRow/SearchRow';

type Props = {
  registration: Registration;
};

const AttendeeList: React.FC<Props> = ({ registration }) => {
  const { t } = useTranslation('attendanceList');

  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const { addNotification } = useNotificationsContext();

  const queryClient = useQueryClient();
  const { data: session } = useSession() as { data: ExtendedSession | null };

  const attendees = orderBy(
    registration.signups as Signup[],
    ['first_name', 'last_name'],
    ['asc', 'asc']
  ).filter((signup) => signup.attendee_status === ATTENDEE_STATUS.Attending);

  const filteredAttendees = attendees.filter((signup) => {
    const { first_name, last_name } = signup;
    const firstLastName = [first_name, last_name]
      .filter(skipFalsyType)
      .join(' ');
    const lastFirstName = [last_name, first_name]
      .filter(skipFalsyType)
      .join(' ');

    return (
      firstLastName.toLowerCase().includes(search.toLowerCase()) ||
      lastFirstName.toLowerCase().includes(search.toLowerCase())
    );
  });

  const patchSignupMutation = usePatchSignupMutation({ session });

  const { handleError } = useHandleError<PatchSignupMutationInput, Signup>();
  const savingFinished = () => {
    setSaving(false);
  };

  const patchSignup = async (checked: boolean, signup: Signup) => {
    setSaving(true);

    const payload: PatchSignupMutationInput = {
      id: signup.id,
      presence_status: checked
        ? PRESENCE_STATUS.Present
        : PRESENCE_STATUS.NotPresent,
    };

    patchSignupMutation.mutate(payload, {
      onError: (error) => {
        handleError({
          error,
          message: 'Failed to patch signup presence status',
          payload,
          object: signup,
          savingFinished,
        });
        addNotification({
          type: 'error',
          label: t('attendanceList:errors.presenceStatusUpdateFails'),
        });
      },
      onSuccess: (data) => {
        queryClient.setQueryData(
          ['registration', registration.id.toString()],
          (oldRegistration: Registration | undefined) =>
            // istanbul ignore next
            oldRegistration
              ? {
                  ...oldRegistration,
                  signups:
                    oldRegistration.signups?.map((su) =>
                      su.id === signup.id ? data : su
                    ) ?? [],
                }
              : oldRegistration
        );

        savingFinished();
      },
    });
  };

  return (
    <>
      <SearchStatus count={filteredAttendees.length} loading={false} />
      <SearchRow
        countText={t('attendanceList:count', {
          count: filteredAttendees.length,
        })}
        onSearchSubmit={
          /* istanbul ignore next */
          () => undefined
        }
        onSearchChange={setSearch}
        searchInputLabel={t('attendanceList:labelSearch')}
        searchValue={search}
      />

      {filteredAttendees.map((signup) => {
        const { fullName } = getSignupFields({ signup });

        return (
          <Checkbox
            disabled={saving}
            key={signup.id}
            id={signup.id}
            label={fullName}
            checked={signup.presence_status === PRESENCE_STATUS.Present}
            onChange={(e) => {
              patchSignup(e.target.checked, signup);
            }}
          />
        );
      })}
      {filteredAttendees.length === 0 && <span>{t('common:noResults')}</span>}
    </>
  );
};

export default AttendeeList;
