/* eslint-disable max-len */
import { NextPage } from 'next';

import EditEnrolmentPage from '../../../../../../../domain/enrolment/EditEnrolmentPage';
import generateEnrolmentGetServerSideProps from '../../../../../../../utils/generateEnrolmentGetServerSideProps';

const EditEnrolment: NextPage = () => <EditEnrolmentPage />;

export const getServerSideProps = generateEnrolmentGetServerSideProps({
  shouldPrefetchEnrolment: true,
  shouldPrefetchPlace: false,
  translationNamespaces: ['common', 'enrolment'],
});

export default EditEnrolment;
