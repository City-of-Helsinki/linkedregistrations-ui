import { NextPage } from 'next';

import EditSignupGroupPage from '../../../../../../domain/signupGroup/EditSignupGroupPage';
import generateGetServerSideProps from '../../../../../../utils/generateGetServerSideProps';

const EditSignupGroup: NextPage = () => <EditSignupGroupPage />;

export const getServerSideProps = generateGetServerSideProps({
  shouldPrefetchPlace: false,
  shouldPrefetchSignup: false,
  shouldPrefetchSignupGroup: true,
  translationNamespaces: ['common', 'signup'],
});

export default EditSignupGroup;
