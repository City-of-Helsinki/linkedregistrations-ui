import { Footer as HdsFooter, Logo, logoFi, LogoSize, logoSv } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import useLocale from '../../../hooks/useLocale';
import { Language } from '../../../types';

import styles from './footer.module.scss';

const logoSrcFromLanguage = (lang: Language) => {
  if (lang === 'sv') {
    return logoSv;
  }
  return logoFi;
};

const Footer: React.FC = () => {
  const { t } = useTranslation('common');
  const locale = useLocale();

  return (
    <HdsFooter className={styles.footer} korosType="calm" title={t('appName')}>
      <HdsFooter.Base
        copyrightHolder={t('footer.copyrightHolder')}
        copyrightText={t('footer.copyrightText')}
        backToTopLabel={t('footer.backToTopLabel')}
        logo={
          <Logo
            src={logoSrcFromLanguage(locale)}
            size={LogoSize.Medium}
            alt={t('logo')}
          />
        }
        logoHref="https://hel.fi"
      >
        <HdsFooter.Link
          href={`https://linkedevents.hel.fi/${locale}/accessibility-statement`}
          label={t('footer.tabs.accessibilityStatement')}
        />
        <HdsFooter.Link
          href={`/${locale}/cookies`}
          label={t('footer.tabs.cookies')}
        />
      </HdsFooter.Base>
    </HdsFooter>
  );
};

export default Footer;
