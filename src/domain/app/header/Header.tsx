import {
  Header as HdsHeader,
  IconCross,
  IconSignin,
  IconSignout,
  IconUser,
  Logo,
  logoFiDark,
  logoSvDark,
} from 'hds-react';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import React from 'react';

import { MAIN_CONTENT_ID, PAGE_HEADER_ID } from '../../../constants';
import useLocale from '../../../hooks/useLocale';
import useSelectLanguage from '../../../hooks/useSelectLanguage';
import useSignIn from '../../../hooks/useSignIn';
import useSignOut from '../../../hooks/useSignOut';
import { ExtendedSession, Language } from '../../../types';
import { getUserFirstName, getUserName } from '../../auth/utils';
import useUser from '../../user/hooks/useUser';

import ActionBarDropdowButton from './actionBarDropdownButton/ActionBarDropdownButton';
import ActionBarDropdownDivider from './actionBarDropdownDivider/ActionBarDropdownDivider';
import ActionBarDropdownHeader from './actionBarDropdownHeader/ActionBarDropdownHeader';
import styles from './header.module.scss';

/* istanbul ignore next */
const logoSrcFromLanguage = (lang: Language) => {
  if (lang === 'sv') {
    return logoSvDark;
  }
  return logoFiDark;
};

const Header: React.FC = () => {
  const { data: session } = useSession() as { data: ExtendedSession | null };
  const linkedEventsApiToken = session?.apiTokens?.linkedevents;
  useUser();

  const locale = useLocale();

  const { changeLanguage, languageOptions } = useSelectLanguage();

  const { t } = useTranslation('common');

  const { handleSignOut } = useSignOut();
  const { handleSignIn } = useSignIn();

  return (
    <HdsHeader
      className={styles.navigation}
      id={PAGE_HEADER_ID}
      defaultLanguage={locale}
      onDidChangeLanguage={changeLanguage}
      languages={languageOptions}
    >
      <HdsHeader.SkipLink
        skipTo={`#${MAIN_CONTENT_ID}`}
        label={t('navigation.skipToContentLabel')}
      />
      <HdsHeader.ActionBar
        className={styles.actionBar}
        title={t('appName')}
        frontPageLabel={t('frontPage')}
        titleAriaLabel={t('appName')}
        titleHref={`/${locale}`}
        logo={<Logo src={logoSrcFromLanguage(locale)} alt={t('logo')} />}
        logoAriaLabel={t('ariaLogo')}
        logoHref={`/${locale}`}
        menuButtonAriaLabel={t('navigation.menuToggleAriaLabel')}
        menuButtonLabel={t('navigation.menuToggleAriaLabel')}
      >
        <HdsHeader.LanguageSelector
          ariaLabel={t('navigation.ariaLanguageSelection')}
        />

        {/* Show login menu if user is not authenticated */}
        {!linkedEventsApiToken && (
          <HdsHeader.ActionBarItem
            closeIcon={<IconCross aria-hidden />}
            closeLabel={t('common:close')}
            label={t('common:signInShort')}
            fixedRightPosition
            icon={<IconUser />}
            id="action-bar-login"
            className={styles.loginMenu}
          >
            <ActionBarDropdownHeader title={t('helsinkiProfile')} />
            <ActionBarDropdownDivider />
            <ActionBarDropdowButton
              className={styles.signInButton}
              iconRight={<IconSignin size="m" aria-hidden />}
              onClick={handleSignIn}
            >
              {t('common:signIn')}
            </ActionBarDropdowButton>
          </HdsHeader.ActionBarItem>
        )}
        {/* Show logout menu if user is authenticated */}
        {linkedEventsApiToken && (
          <HdsHeader.ActionBarItem
            closeIcon={<IconCross aria-hidden />}
            closeLabel={t('close')}
            label={getUserFirstName({ session })}
            fixedRightPosition
            icon={<IconUser />}
            id="action-bar-logout"
          >
            <ActionBarDropdownHeader title={getUserName({ session })} />
            <ActionBarDropdownDivider />
            <ActionBarDropdowButton
              className={styles.signOutButton}
              iconRight={<IconSignout size="m" aria-hidden />}
              onClick={handleSignOut}
            >
              {t('common:signOut')}
            </ActionBarDropdowButton>
          </HdsHeader.ActionBarItem>
        )}
      </HdsHeader.ActionBar>
    </HdsHeader>
  );
};

export default Header;
