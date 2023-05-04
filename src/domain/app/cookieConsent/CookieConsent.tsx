import { CookieModal } from 'hds-react';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { PAGE_HEADER_ID } from '../../../constants';
import useLocale from '../../../hooks/useLocale';
import useSelectLanguage from '../../../hooks/useSelectLanguage';

type SupportedLanguage = 'en' | 'fi' | 'sv';

/* istanbul ignore next */
const origin = typeof window !== 'undefined' ? window.location.origin : '';

const CookieConsent: FC = () => {
  const { t } = useTranslation('common');
  const locale = useLocale();

  const { languageOptions, changeLanguage } = useSelectLanguage();

  const onLanguageChange = async (lang: string) => {
    const langOption = languageOptions.find(
      (l) => l.value === (lang as SupportedLanguage)
    );

    if (langOption) {
      changeLanguage(langOption)();
    }
  };

  return (
    <CookieModal
      contentSource={{
        siteName: t('cookieConsent.siteName') as string,
        currentLanguage: locale,
        requiredCookies: {
          groups: [
            {
              commonGroup: 'login',
              cookies: [{ commonCookie: 'tunnistamo' }],
            },
            {
              commonGroup: 'userInputs',
              cookies: [
                {
                  id: 'enrolmentForm',
                  hostName: origin,
                  name: t('cookieConsent.enrolmentForm.name') as string,
                  description: t(
                    'cookieConsent.enrolmentForm.description'
                  ) as string,
                  expiration: t('cookieConsent.expiration.session') as string,
                },
              ],
            },
          ],
        },
        optionalCookies: {
          groups: [
            {
              commonGroup: 'statistics',
              cookies: [{ commonCookie: 'matomo' }],
            },
          ],
        },
        language: { onLanguageChange },
        focusTargetSelector: `#${PAGE_HEADER_ID}`,
      }}
    />
  );
};

export default CookieConsent;
