import { NextPage } from 'next';

import SignupCompletedPage from '../../../../../../domain/signup/SignupCompletedPage';
import generateGetServerSideProps from '../../../../../../utils/generateGetServerSideProps';

const SignupCompleted: NextPage = () => <SignupCompletedPage />;

export const getServerSideProps = generateGetServerSideProps({
  shouldPrefetchPlace: false,
  shouldPrefetchSignup: true,
  shouldPrefetchSignupGroup: false,
  translationNamespaces: ['common', 'signup'],
});

export default SignupCompleted;
