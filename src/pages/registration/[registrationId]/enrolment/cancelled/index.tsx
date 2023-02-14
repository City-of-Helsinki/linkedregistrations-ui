import { NextPage } from 'next';

import EnrolmentCancelledPage from '../../../../../domain/enrolment/EnrolmentCancelledPage';
import generateEnrolmentGetServerSideProps from '../../../../../utils/generateEnrolmentGetServerSideProps';

const EnrolmentCancelled: NextPage = () => <EnrolmentCancelledPage />;

export const getServerSideProps = generateEnrolmentGetServerSideProps({
  shouldPrefetchEnrolment: false,
  shouldPrefetchPlace: false,
  translationNamespaces: ['common', 'enrolment'],
});

export default EnrolmentCancelled;
