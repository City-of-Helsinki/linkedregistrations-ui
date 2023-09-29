import { NextPage } from 'next';

import SignupCancelledPage from '../../../../../domain/signup/SignupCancelledPage';
import generateGetServerSideProps from '../../../../../utils/generateGetServerSideProps';

const SignupGroupCancelled: NextPage = () => <SignupCancelledPage />;

export const getServerSideProps = generateGetServerSideProps({
  shouldPrefetchPlace: false,
  shouldPrefetchSignup: false,
  shouldPrefetchSignupGroup: false,
  translationNamespaces: ['common', 'signup'],
});

export default SignupGroupCancelled;
