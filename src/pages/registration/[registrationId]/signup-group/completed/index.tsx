import { NextPage } from 'next';

import SignupGroupCompletedPage from '../../../../../domain/signupGroup/SignupGroupCompletedPage';
import generateGetServerSideProps from '../../../../../utils/generateGetServerSideProps';

const SignupGroupCompleted: NextPage = () => <SignupGroupCompletedPage />;

export const getServerSideProps = generateGetServerSideProps({
  shouldPrefetchPlace: false,
  shouldPrefetchSignup: false,
  shouldPrefetchSignupGroup: false,
  translationNamespaces: ['common', 'signup'],
});

export default SignupGroupCompleted;
