import { NextPage } from 'next';

import EditSignupPage from '../../../../../../domain/signup/EditSignupPage';
import generateGetServerSideProps from '../../../../../../utils/generateGetServerSideProps';

const EditSignup: NextPage = () => <EditSignupPage />;

export const getServerSideProps = generateGetServerSideProps({
  shouldPrefetchPlace: false,
  shouldPrefetchSignup: true,
  shouldPrefetchSignupGroup: false,
  translationNamespaces: ['common', 'signup'],
});

export default EditSignup;
