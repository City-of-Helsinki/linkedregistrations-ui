import getConfig from 'next/config';

const getPublicRuntimeConfig = () => {
  const {
    publicRuntimeConfig: { linkedEventsApiBaseUrl },
  } = getConfig();

  if (!linkedEventsApiBaseUrl) {
    throw new Error(
      'Invalid configuration. Some required public runtime variable are missing'
    );
  }

  return { linkedEventsApiBaseUrl };
};

export default getPublicRuntimeConfig;
