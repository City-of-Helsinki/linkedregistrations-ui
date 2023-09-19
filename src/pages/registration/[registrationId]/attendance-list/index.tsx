/* eslint-disable max-len */
import { NextPage } from 'next';

import AttendanceListPageWrapper from '../../../../domain/attendanceList/AttendanceListPage';
import generateAttendanceListGetServerSideProps from '../../../../utils/generateAttendanceListGetServerSideProps';

const AttendanceListPage: NextPage = () => <AttendanceListPageWrapper />;

export const getServerSideProps = generateAttendanceListGetServerSideProps({
  translationNamespaces: ['common', 'attendanceList'],
});

export default AttendanceListPage;
