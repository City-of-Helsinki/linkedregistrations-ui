import { CookieConsentReactProps } from 'hds-react';

import { PAGE_HEADER_ID } from '../constants';
import siteSettings from '../domain/app/cookieConsent/data/siteSettings.json';

import useLocale from './useLocale';

/* istanbul ignore next */
const hostname =
  typeof window !== 'undefined'
    ? window.location.hostname
    : new URL(process.env.NEXTAUTH_URL as string).hostname;

const useCookieConsentSettings = () => {
  const locale = useLocale();

  const { requiredGroups } = siteSettings;

  const requiredGroupsTransform = requiredGroups.map((group) => {
    const cookies = group.cookies.map((cookie) => {
      if (!cookie.host) {
        return {
          ...cookie,
          host: hostname,
        };
      }

      return cookie;
    });

    return {
      ...group,
      cookies,
    };
  });

  const cookieConsentProps: CookieConsentReactProps = {
    onChange: () => {},
    siteSettings: {
      ...siteSettings,
      requiredGroups: requiredGroupsTransform,
    },
    options: { focusTargetSelector: `#${PAGE_HEADER_ID}`, language: locale },
  };

  return cookieConsentProps;
};

export default useCookieConsentSettings;
