import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

import { ExtendedSession } from '../../../types';
import { useEnrolmentQuery } from '../query';
import { Enrolment } from '../types';

type UseEnrolmentDataState = {
  enrolment: Enrolment | undefined;
  isLoading: boolean;
};

const useEnrolmentData = (): UseEnrolmentDataState => {
  const router = useRouter();
  const { query } = router;
  const { data: session } = useSession() as { data: ExtendedSession | null };

  const {
    data: enrolment,
    isFetching,
    status,
  } = useEnrolmentQuery({
    args: { cancellationCode: query.accessCode as string },
    session,
  });

  const isLoading = status === 'loading' && isFetching;

  return { enrolment, isLoading };
};

export default useEnrolmentData;
