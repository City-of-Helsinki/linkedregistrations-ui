import { NextPage } from 'next';

import EnrolmentCompletedPage from '../../../../../domain/enrolment/EnrolmentCompletedPage';
import generateEnrolmentGetServerSideProps from '../../../../../utils/generateEnrolmentGetServerSideProps';

const EnrolmentCompleted: NextPage = () => <EnrolmentCompletedPage />;

export const getServerSideProps = generateEnrolmentGetServerSideProps({
  shouldPrefetchEnrolment: false,
  shouldPrefetchPlace: false,
  translationNamespaces: ['common', 'enrolment'],
});

export default EnrolmentCompleted;
