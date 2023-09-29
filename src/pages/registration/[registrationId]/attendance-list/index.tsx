/* eslint-disable max-len */
import { NextPage } from 'next';

import AttendanceListPageWrapper from '../../../../domain/attendanceList/AttendanceListPage';
import { REGISTRATION_INCLUDES } from '../../../../domain/registration/constants';
import generateGetServerSideProps from '../../../../utils/generateGetServerSideProps';

const AttendanceListPage: NextPage = () => <AttendanceListPageWrapper />;

export const getServerSideProps = generateGetServerSideProps({
  overrideRegistrationsVariables: {
    include: [...REGISTRATION_INCLUDES, 'signups'],
  },
  shouldPrefetchPlace: false,
  shouldPrefetchSignup: false,
  shouldPrefetchSignupGroup: false,
  translationNamespaces: ['common', 'attendanceList'],
});

export default AttendanceListPage;
