import { parseLoginMethods } from '../constants';

const getPublicRuntimeConfig = () => {
  const linkedEventsApiBaseUrl = process.env.NEXT_PUBLIC_LINKED_EVENTS_URL;
  const webStoreApiBaseUrl = process.env.NEXT_PUBLIC_WEB_STORE_API_BASE_URL;
  const attendanceListLoginMethods =
    process.env.NEXT_PUBLIC_ATTENDANCE_LIST_LOGIN_METHODS;
  const signupsLoginMethods = process.env.NEXT_PUBLIC_SIGNUPS_LOGIN_METHODS;

  if (
    !linkedEventsApiBaseUrl ||
    !webStoreApiBaseUrl ||
    !attendanceListLoginMethods ||
    !signupsLoginMethods
  ) {
    throw new Error(
      'Invalid configuration. Some required public runtime variable are missing'
    );
  }

  return {
    linkedEventsApiBaseUrl,
    webStoreApiBaseUrl,
    attendanceListLoginMethods: parseLoginMethods(attendanceListLoginMethods),
    signupsLoginMethods: parseLoginMethods(signupsLoginMethods),
  };
};

export default getPublicRuntimeConfig;
