import { QueryObserverResult } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

import { ExtendedSession } from '../../../types';
import { useSignupQuery } from '../query';
import { Signup } from '../types';

type UseSignupDataProps = {
  id?: string;
};

type UseSignupDataState = {
  isLoading: boolean;
  refetch: () => Promise<QueryObserverResult<Signup>>;
  signup: Signup | undefined;
};

const useSignupData = ({
  id: _id,
}: UseSignupDataProps = {}): UseSignupDataState => {
  const router = useRouter();
  const { query } = router;
  const { data: session } = useSession() as { data: ExtendedSession | null };

  const {
    data: signup,
    isFetching,
    refetch,
    status,
  } = useSignupQuery({
    args: { id: _id ?? (query.signupId as string) },
    session,
  });

  const isLoading = status === 'loading' && isFetching;

  return { isLoading, refetch, signup };
};

export default useSignupData;
