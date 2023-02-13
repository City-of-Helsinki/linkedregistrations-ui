import { useRouter } from 'next/router';

import { EVENT_INCLUDES } from '../../event/constants';
import { useEventQuery } from '../../event/query';
import { Event } from '../../event/types';
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

  const {
    data: registration,
    isFetching: isFetchingRegistration,
    status: statusRegistration,
  } = useRegistrationQuery(
    { id: query.registrationId as string },
    { enabled: !!query.registrationId, retry: 0 }
  );

  const {
    data: event,
    isFetching: isFetchingEvent,
    status: statusEvent,
  } = useEventQuery(
    {
      id: registration?.event as string,
      include: EVENT_INCLUDES,
    },
    { enabled: !!registration?.event }
  );

  const isLoading =
    (statusRegistration === 'loading' && isFetchingRegistration) ||
    (statusEvent === 'loading' && isFetchingEvent);

  return { event, isLoading, registration };
};

export default useEventAndRegistrationData;
