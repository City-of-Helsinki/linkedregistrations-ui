import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

import { ExtendedSession } from '../../../types';
import { Event } from '../../event/types';
import { REGISTRATION_INCLUDES } from '../constants';
import { useRegistrationQuery } from '../query';
import { Registration, RegistrationQueryVariables } from '../types';

type UseRegistrationAndEventDataProps = {
  overrideRegistrationsVariables?: Partial<RegistrationQueryVariables>;
};

type UseEventAndRegistrationDataState = {
  event: Event | undefined;
  isLoading: boolean;
  registration: Registration | undefined;
};

const useEventAndRegistrationData = ({
  overrideRegistrationsVariables,
}: UseRegistrationAndEventDataProps = {}): UseEventAndRegistrationDataState => {
  const router = useRouter();
  const { query } = router;
  const { data: session } = useSession() as { data: ExtendedSession | null };

  const { data: registration, isLoading } = useRegistrationQuery({
    args: {
      id: query.registrationId as string,
      include: REGISTRATION_INCLUDES,
      ...overrideRegistrationsVariables,
    },
    options: { enabled: !!query.registrationId, retry: 0 },
    session,
  });

  return { event: registration?.event, isLoading, registration };
};

export default useEventAndRegistrationData;
