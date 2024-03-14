import { Pagination, Table } from 'hds-react';
import omit from 'lodash/omit';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import LoadingSpinner from '../../../common/components/loadingSpinner/LoadingSpinner';
import { READ_ONLY_PLACEHOLDER } from '../../../constants';
import useCommonListProps from '../../../hooks/useCommonListProps';
import useIdWithPrefix from '../../../hooks/useIdWithPrefix';
import { ExtendedSession } from '../../../types';
import skipFalsyType from '../../../utils/skipFalsyType';
import { ROUTES } from '../../app/routes/constants';
import { Registration } from '../../registration/types';
import { ATTENDEE_STATUS } from '../../signup/constants';
import { Signup } from '../../signup/types';
import { getSignupFields } from '../../signup/utils';
import { useSignupGroupQuery } from '../../signupGroup/query';
import { SIGNUPS_PAGE_SIZE, SIGNUPS_SEARCH_PARAMS } from '../constants';
import { useSignupsQuery } from '../query';
import { getSignupsSearchInitialValues } from '../utils';

import styles from './signupsTable.module.scss';

type ColumnProps = {
  signup: Signup;
};

const getValueOrPlaceholder = (value: string | null | undefined) =>
  value || READ_ONLY_PLACEHOLDER;

const NameColumn: FC<ColumnProps> = ({ signup }) => {
  const router = useRouter();
  const { fullName, signupGroup } = getSignupFields({
    signup,
  });

  return (
    <div className={styles.nameWrapper}>
      <span className={styles.signupName} title={fullName}>
        <Link
          href={{
            pathname: signupGroup
              ? ROUTES.EDIT_SIGNUP_GROUP
              : ROUTES.EDIT_SIGNUP,
            query: omit(
              {
                ...router.query,
                [SIGNUPS_SEARCH_PARAMS.RETURN_PATH]: router.asPath,
                signupGroupId: signupGroup ?? undefined,
                signupId: signup.id,
              },
              signupGroup ? 'signupId' : 'signupGroupId'
            ),
          }}
        >
          {getValueOrPlaceholder(fullName)}
        </Link>
      </span>
    </div>
  );
};

const PhoneColumn: FC<ColumnProps> = ({ signup }) => {
  return getSignupFields({ signup }).phoneNumber;
};

const ContactPersonEmailColumn: FC<ColumnProps> = ({ signup }) => {
  const { data: session } = useSession() as { data: ExtendedSession | null };
  const { data, isFetching } = useSignupGroupQuery({
    args: { id: signup.signup_group as string },
    options: { enabled: !!signup.signup_group },
    session,
  });

  return (
    <LoadingSpinner
      className={styles.columnLoadingSpinner}
      isLoading={isFetching}
      small
    >
      {getValueOrPlaceholder(
        data?.contact_person?.email ||
          getSignupFields({ signup }).contactPersonEmail
      )}
    </LoadingSpinner>
  );
};

const ContactPersonPhoneColumn: FC<ColumnProps> = ({ signup }) => {
  const { data: session } = useSession() as { data: ExtendedSession | null };
  const { data, isFetching } = useSignupGroupQuery({
    args: { id: signup.signup_group as string },
    options: { enabled: !!signup.signup_group },
    session,
  });

  return (
    <LoadingSpinner
      className={styles.columnLoadingSpinner}
      isLoading={isFetching}
      small
    >
      {getValueOrPlaceholder(
        data?.contact_person?.phone_number ||
          getSignupFields({ signup }).contactPersonPhoneNumber
      )}
    </LoadingSpinner>
  );
};

const AttendeeStatusColumn: FC<ColumnProps> = ({ signup }) => {
  const { t } = useTranslation('signups');
  const { attendeeStatus } = getSignupFields({
    signup,
  });

  return getValueOrPlaceholder(t(`signups:attendeeStatus.${attendeeStatus}`));
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

  const { data: signupsData, isLoading } = useSignupsQuery({
    args: {
      attendeeStatus: ATTENDEE_STATUS.Attending,
      registration: [registration.id],
      page,
      pageSize: SIGNUPS_PAGE_SIZE,
      text: text,
    },
    session,
  });

  const signups = (signupsData?.data ?? []).filter(skipFalsyType);

  const MemoizedNameColumn = React.useCallback(
    (signup: Signup) => <NameColumn signup={signup} />,
    []
  );

  const MemoizedPhoneColumn = React.useCallback(
    (signup: Signup) => <PhoneColumn signup={signup} />,
    []
  );

  const MemoizedContactPersonEmailColumn = React.useCallback(
    (signup: Signup) => <ContactPersonEmailColumn signup={signup} />,
    []
  );

  const MemoizedContactPersonPhoneColumn = React.useCallback(
    (signup: Signup) => <ContactPersonPhoneColumn signup={signup} />,
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
            key: 'phone',
            headerName: t('signups:signupsTableColumns.phoneNumber'),
            transform: MemoizedPhoneColumn,
          },
          {
            key: 'contactPersonEmail',
            headerName: t('signups:signupsTableColumns.contactPersonEmail'),
            transform: MemoizedContactPersonEmailColumn,
          },
          {
            key: 'contactPersonPhoneNumber',
            headerName: t(
              'signups:signupsTableColumns.contactPersonPhoneNumber'
            ),
            transform: MemoizedContactPersonPhoneColumn,
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
