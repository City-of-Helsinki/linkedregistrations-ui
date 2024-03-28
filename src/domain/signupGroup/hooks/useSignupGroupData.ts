import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

import { ExtendedSession } from '../../../types';
import getStringValueFromQuery from '../../../utils/getStringValueFromQuery';
import { useSignupGroupQuery } from '../query';
import { SignupGroup } from '../types';

type UseSignupGroupDataState = {
  isLoading: boolean;
  signupGroup: SignupGroup | undefined;
};

const useSignupGroupData = (): UseSignupGroupDataState => {
  const { query } = useRouter();
  const accessCode = getStringValueFromQuery(query, 'access_code');
  const id = query.signupGroupId as string;
  const { data: session } = useSession() as { data: ExtendedSession | null };

  const { data: signupGroup, isLoading } = useSignupGroupQuery({
    args: { accessCode, id },
    session,
  });

  return { isLoading, signupGroup };
};

export default useSignupGroupData;
