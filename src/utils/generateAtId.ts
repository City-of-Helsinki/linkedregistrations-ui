import getPublicRuntimeConfig from './getPublicRuntimeConfig';

const generateAtId = (id: string, endpoint: string): string => {
  const { linkedEventsApiBaseUrl } = getPublicRuntimeConfig();

  return `${linkedEventsApiBaseUrl}/${endpoint}/${id}/`;
};

export default generateAtId;
