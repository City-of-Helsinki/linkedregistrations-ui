/* eslint-disable max-len */
import { NextPage } from 'next';

import CreateEnrolmentSummaryPage from '../../../../../../domain/enrolment/summaryPage/SummaryPage';
import generateEnrolmentGetServerSideProps from '../../../../../../utils/generateEnrolmentGetServerSideProps';

const CreateEnrolment: NextPage = () => <CreateEnrolmentSummaryPage />;

export const getServerSideProps = generateEnrolmentGetServerSideProps({
  shouldPrefetchEnrolment: false,
  shouldPrefetchPlace: true,
  translationNamespaces: ['common', 'enrolment', 'reservation', 'summary'],
});

export default CreateEnrolment;
