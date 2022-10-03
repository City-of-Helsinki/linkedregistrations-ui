import classNames from 'classnames';
import { IconSignout, Navigation } from 'hds-react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { MAIN_CONTENT_ID, PAGE_HEADER_ID } from '../../../constants';
import useLocale from '../../../hooks/useLocale';
import useSelectLanguage from '../../../hooks/useSelectLanguage';
import { useUserQuery } from '../../user/query';
import { ROUTES } from '../routes/constants';
import styles from './header.module.scss';

const Header: React.FC = () => {
  const { data: session } = useSession();

  const { data: user } = useUserQuery(
    { username: session?.sub as string },
    { enabled: !!session?.sub }
  );

  const locale = useLocale();
  const router = useRouter();
  const { changeLanguage, languageOptions } = useSelectLanguage();

  const { t } = useTranslation('common');
  const [menuOpen, setMenuOpen] = React.useState(false);

  const goToHomePage = (e?: Event) => {
    e?.preventDefault();
    router.push(`/${locale}${ROUTES.HOME}`);
    toggleMenu();
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <Navigation
      id={PAGE_HEADER_ID}
      menuOpen={menuOpen}
      onMenuToggle={toggleMenu}
      menuToggleAriaLabel={t('navigation.menuToggleAriaLabel')}
      skipTo={`#${MAIN_CONTENT_ID}`}
      skipToContentLabel={t('navigation.skipToContentLabel')}
      className={styles.navigation}
      onTitleClick={goToHomePage}
      title={t('appName')}
      titleUrl={`/${locale}${ROUTES.HOME}`}
      logoLanguage={locale === 'sv' ? /* istanbul ignore next */ 'sv' : 'fi'}
    >
      <Navigation.Actions>
        <Navigation.User
          authenticated={Boolean(session && user)}
          label={t('common:signIn')}
          onSignIn={() => signIn('tunnistamo')}
          userName={user?.display_name}
        >
          <Navigation.Item
            label={t('common:signOut')}
            href="#"
            icon={<IconSignout aria-hidden />}
            variant="supplementary"
            onClick={() => signOut()}
          />
        </Navigation.User>
        <Navigation.LanguageSelector
          buttonAriaLabel={t('navigation.languageSelectorAriaLabel')}
          className={classNames(styles.languageSelector)}
          label={t(`navigation.languages.${locale}`)}
        >
          {languageOptions.map((option) => (
            <Navigation.Item
              key={option.value}
              href="#"
              lang={option.value}
              label={option.label}
              onClick={changeLanguage(option)}
            />
          ))}
        </Navigation.LanguageSelector>
      </Navigation.Actions>
    </Navigation>
  );
};

export default Header;
