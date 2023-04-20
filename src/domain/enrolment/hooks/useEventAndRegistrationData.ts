import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

import { ExtendedSession } from '../../../types';
import { Event } from '../../event/types';
import { REGISTRATION_INCLUDES } from '../../registration/constants';
import { useRegistrationQuery } from '../../registration/query';
import { Registration } from '../../registration/types';

type UseEventAndRegistrationDataState = {
  event: Event | undefined;
  isLoading: boolean;
  registration: Registration | undefined;
};

const useEventAndRegistrationData = (): UseEventAndRegistrationDataState => {
  const router = useRouter();
  const { query } = router;
  const { data: session } = useSession() as { data: ExtendedSession | null };

  const {
    data: registration,
    isFetching: isFetchingRegistration,
    status: statusRegistration,
  } = useRegistrationQuery({
    args: {
      id: query.registrationId as string,
      include: REGISTRATION_INCLUDES,
    },
    options: { enabled: !!query.registrationId, retry: 0 },
    session,
  });

  const isLoading = statusRegistration === 'loading' && isFetchingRegistration;

  return { event: registration?.event, isLoading, registration };
};

export default useEventAndRegistrationData;
