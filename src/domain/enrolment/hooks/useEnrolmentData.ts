import { useRouter } from 'next/router';

import { useEnrolmentQuery } from '../query';
import { Enrolment } from '../types';

type UseEnrolmentDataState = {
  enrolment: Enrolment | undefined;
  isLoading: boolean;
};

const useEnrolmentData = (): UseEnrolmentDataState => {
  const router = useRouter();
  const { query } = router;

  const {
    data: enrolment,
    isFetching,
    status,
  } = useEnrolmentQuery({
    cancellationCode: query.accessCode as string,
  });

  const isLoading = status === 'loading' && isFetching;

  return { enrolment, isLoading };
};

export default useEnrolmentData;
