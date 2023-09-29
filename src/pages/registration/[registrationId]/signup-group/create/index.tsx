import { NextPage } from 'next';

import CreateSignupGroupPage from '../../../../../domain/signupGroup/CreateSignupGroupPage';
import generateGetServerSideProps from '../../../../../utils/generateGetServerSideProps';

const CreateSignupGroup: NextPage = () => <CreateSignupGroupPage />;

export const getServerSideProps = generateGetServerSideProps({
  shouldPrefetchPlace: true,
  shouldPrefetchSignup: false,
  shouldPrefetchSignupGroup: false,
  translationNamespaces: ['common', 'reservation', 'signup'],
});

export default CreateSignupGroup;
