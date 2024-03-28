import { QueryObserverResult } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

import { ExtendedSession } from '../../../types';
import getStringValueFromQuery from '../../../utils/getStringValueFromQuery';
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
  const { query } = useRouter();
  const accessCode = getStringValueFromQuery(query, 'access_code');
  const id = _id ?? (query.signupId as string);
  const { data: session } = useSession() as { data: ExtendedSession | null };

  const {
    data: signup,
    isLoading,
    refetch,
  } = useSignupQuery({ args: { id, accessCode }, session });

  return { isLoading, refetch, signup };
};

export default useSignupData;
