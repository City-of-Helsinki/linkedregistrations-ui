import { NextPage } from 'next';

import CreateSignupGroupSummaryPage from '../../../../../../domain/signupGroup/summaryPage/SummaryPage';
import generateGetServerSideProps from '../../../../../../utils/generateGetServerSideProps';

const SummaryPage: NextPage = () => <CreateSignupGroupSummaryPage />;

export const getServerSideProps = generateGetServerSideProps({
  shouldPrefetchPlace: true,
  shouldPrefetchSignup: false,
  shouldPrefetchSignupGroup: false,
  translationNamespaces: ['common', 'reservation', 'signup', 'summary'],
});

export default SummaryPage;
