import { NextPage } from 'next';

import CreateEnrolmentPage from '../../../../../domain/enrolment/CreateEnrolmentPage';
import generateEnrolmentGetServerSideProps from '../../../../../utils/generateEnrolmentGetServerSideProps';

const CreateEnrolment: NextPage = () => <CreateEnrolmentPage />;

export const getServerSideProps = generateEnrolmentGetServerSideProps({
  shouldPrefetchEnrolment: false,
  shouldPrefetchPlace: true,
  translationNamespaces: ['common', 'enrolment', 'reservation'],
});

export default CreateEnrolment;
