const getServerRuntimeConfig = () => {
  const env = process.env.NEXT_ENV;
  const oidcApiTokensUrl = process.env.OIDC_API_TOKENS_URL;
  const oidcClientId = process.env.OIDC_CLIENT_ID;
  const oidcClientSecret = process.env.OIDC_CLIENT_SECRET;
  const oidcIssuer = process.env.OIDC_ISSUER;
  const oidcLinkedEventsApiScope = process.env.OIDC_LINKED_EVENTS_API_SCOPE;

  if (
    !env ||
    !oidcApiTokensUrl ||
    !oidcClientId ||
    !oidcClientSecret ||
    !oidcIssuer ||
    !oidcLinkedEventsApiScope
  ) {
    throw new Error(
      'Invalid configuration. Some required server runtime variable are missing'
    );
  }

  return {
    env,
    oidcApiTokensUrl,
    oidcClientId,
    oidcClientSecret,
    oidcIssuer,
    oidcLinkedEventsApiScope,
  };
};

export default getServerRuntimeConfig;
