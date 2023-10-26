/* eslint-disable max-len */
import { NextPage } from 'next';

import SignupsPageWrapper from '../../../../domain/singups/SignupsPage';
import generateGetServerSideProps from '../../../../utils/generateGetServerSideProps';

const SignupsPage: NextPage = () => <SignupsPageWrapper />;

export const getServerSideProps = generateGetServerSideProps({
  shouldPrefetchPlace: false,
  shouldPrefetchSignup: false,
  shouldPrefetchSignupGroup: false,
  translationNamespaces: ['common', 'signups'],
});

export default SignupsPage;
