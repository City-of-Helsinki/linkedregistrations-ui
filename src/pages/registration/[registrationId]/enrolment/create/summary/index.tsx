/* eslint-disable max-len */
import { NextPage } from 'next';

import generateEnrolmentGetServerSideProps from '../../../../../../domain/enrolment/generateEnrolmentGetServerSideProps';
import CreateEnrolmentSummaryPage from '../../../../../../domain/enrolment/summaryPage/SummaryPage';

const CreateEnrolment: NextPage = () => <CreateEnrolmentSummaryPage />;

export const getServerSideProps = generateEnrolmentGetServerSideProps({
  shouldPrefetchEnrolment: false,
  shouldPrefetchPlace: true,
  translationNamespaces: ['common', 'enrolment', 'reservation', 'summary'],
});

export default CreateEnrolment;
