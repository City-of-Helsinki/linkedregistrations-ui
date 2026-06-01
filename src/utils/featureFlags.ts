import getEnvValue from './getEnvValue';

export type FeatureFlags = {
  WEB_STORE_INTEGRATION: boolean;
};

const getFeatureFlags = (): FeatureFlags => ({
  WEB_STORE_INTEGRATION:
    getEnvValue('NEXT_PUBLIC_WEB_STORE_INTEGRATION_ENABLED') === 'true',
});

const isFeatureEnabled = (feature: keyof FeatureFlags): boolean =>
  getFeatureFlags()[feature];

export const featureFlagUtils = {
  isFeatureEnabled,
  getFeatureFlags,
};
