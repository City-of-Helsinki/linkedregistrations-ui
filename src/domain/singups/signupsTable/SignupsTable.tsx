import { Pagination, Table } from 'hds-react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import LoadingSpinner from '../../../common/components/loadingSpinner/LoadingSpinner';
import useCommonListProps from '../../../hooks/useCommonListProps';
import useIdWithPrefix from '../../../hooks/useIdWithPrefix';
import { ExtendedSession } from '../../../types';
import skipFalsyType from '../../../utils/skipFalsyType';
import { Registration } from '../../registration/types';
import { ATTENDEE_STATUS } from '../../signup/constants';
import { Signup } from '../../signup/types';
import { getSignupFields } from '../../signup/utils';
import { SIGNUPS_PAGE_SIZE } from '../constants';
import { useSignupsQuery } from '../query';
import { getSignupsSearchInitialValues } from '../utils';

import styles from './signupsTable.module.scss';

type ColumnProps = {
  signup: Signup;
};

const NameColumn: FC<ColumnProps> = ({ signup }) => {
  const { fullName } = getSignupFields({
    signup,
  });

  return (
    <div className={styles.nameWrapper}>
      <span className={styles.signupName} title={fullName}>
        {fullName}
      </span>
    </div>
  );
};

const EmailColumn: FC<ColumnProps> = ({ signup }) => {
  const { email } = getSignupFields({ signup });

  return (
    <>
      {email ||
        /* istanbul ignore next */
        '-'}
    </>
  );
};

const PhoneColumn: FC<ColumnProps> = ({ signup }) => {
  const { phoneNumber } = getSignupFields({ signup });

  return (
    <>
      {phoneNumber ||
        /* istanbul ignore next */
        '-'}
    </>
  );
};

const AttendeeStatusColumn: FC<ColumnProps> = ({ signup }) => {
  const { t } = useTranslation('signups');
  const { attendeeStatus } = getSignupFields({
    signup,
  });

  return <>{t(`signups:attendeeStatus.${attendeeStatus}`)}</>;
};

export interface SignupsTableProps {
  caption: string;
  registration: Registration;
}

const SignupsTable: React.FC<SignupsTableProps> = ({
  caption,
  registration,
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: session } = useSession() as { data: ExtendedSession | null };

  const signupListId = useIdWithPrefix({
    prefix: 'signup-attendee-list-',
  });

  const { text, page } = getSignupsSearchInitialValues(router.query);

  const {
    data: signupsData,
    status,
    isFetching,
  } = useSignupsQuery({
    args: {
      attendeeStatus: ATTENDEE_STATUS.Attending,
      registration: [registration.id],
      page,
      pageSize: SIGNUPS_PAGE_SIZE,
      text: text,
    },
    session,
  });
  const isLoading = status === 'loading' && isFetching;

  const signups = (signupsData?.data ?? []).filter(skipFalsyType);

  const MemoizedNameColumn = React.useCallback(
    (signup: Signup) => <NameColumn signup={signup} />,
    []
  );

  const MemoizedEmailColumn = React.useCallback(
    (signup: Signup) => <EmailColumn signup={signup} />,
    []
  );

  const MemoizedPhoneColumn = React.useCallback(
    (signup: Signup) => <PhoneColumn signup={signup} />,
    []
  );

  const MemoizedAttendeeStatusColumn = React.useCallback(
    (signup: Signup) => <AttendeeStatusColumn signup={signup} />,
    []
  );

  const { onPageChange, pageCount, pageHref } = useCommonListProps({
    listId: signupListId,
    meta: signupsData?.meta,
    pageSize: SIGNUPS_PAGE_SIZE,
  });

  return (
    <div id={signupListId}>
      <Table
        caption={caption}
        cols={[
          {
            key: 'name',
            headerName: t('signups:signupsTableColumns.name'),
            transform: MemoizedNameColumn,
          },
          {
            key: 'email',
            headerName: t('signups:signupsTableColumns.email'),
            transform: MemoizedEmailColumn,
          },
          {
            key: 'phone',
            headerName: t('signups:signupsTableColumns.phone'),
            transform: MemoizedPhoneColumn,
          },
          {
            key: 'status',
            headerName: t('signups:signupsTableColumns.status'),
            transform: MemoizedAttendeeStatusColumn,
          },
        ]}
        indexKey="id"
        rows={signups}
        variant="light"
      />
      <LoadingSpinner isLoading={isLoading}>
        {!signups.length && <div className={styles.noResults}>Ei tuloksia</div>}
      </LoadingSpinner>

      <div className={styles.pagination}>
        <Pagination
          onChange={onPageChange}
          pageCount={pageCount}
          pageIndex={page - 1}
          pageHref={pageHref}
          paginationAriaLabel="Pagination"
        />
      </div>
    </div>
  );
};

export default SignupsTable;
