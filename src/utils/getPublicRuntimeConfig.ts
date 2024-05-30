import getConfig from 'next/config';

const getPublicRuntimeConfig = () => {
  const {
    publicRuntimeConfig: { linkedEventsApiBaseUrl, webStoreApiBaseUrl },
  } = getConfig();

  if (!linkedEventsApiBaseUrl || !webStoreApiBaseUrl) {
    throw new Error(
      'Invalid configuration. Some required public runtime variable are missing'
    );
  }

  return { linkedEventsApiBaseUrl, webStoreApiBaseUrl };
};

export default getPublicRuntimeConfig;
