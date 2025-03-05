import getConfig from 'next/config';

import { parseLoginMethods } from "../constants";

const getPublicRuntimeConfig = () => {
  const {
    publicRuntimeConfig: {
      linkedEventsApiBaseUrl,
      webStoreApiBaseUrl,
      attendanceListLoginMethods,
      signupsLoginMethods
    },
  } = getConfig();

  if (!linkedEventsApiBaseUrl || !webStoreApiBaseUrl || !attendanceListLoginMethods || !signupsLoginMethods) {
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
