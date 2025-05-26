import { init } from '@socialgouv/matomo-next';
import classNames from 'classnames';
import { useGroupConsent } from 'hds-react';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

import { SIGNUP_QUERY_PARAMS } from '../../../signup/constants';
import Footer from '../../footer/Footer';
import Header from '../../header/Header';

import styles from './pageLayout.module.scss';

const MATOMO_ENABLED = process.env.NEXT_PUBLIC_MATOMO_ENABLED;
const MATOMO_URL = process.env.NEXT_PUBLIC_MATOMO_URL;
const MATOMO_SITE_ID = process.env.NEXT_PUBLIC_MATOMO_SITE_ID;
const MATOMO_JS_TRACKER_FILE = process.env.NEXT_PUBLIC_MATOMO_JS_TRACKER_FILE;
const MATOMO_PHP_TRACKER_FILE = process.env.NEXT_PUBLIC_MATOMO_PHP_TRACKER_FILE;

const PageLayout: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => {
  const {
    query: { [SIGNUP_QUERY_PARAMS.IFRAME]: iframe },
  } = useRouter();
  const isIframe = iframe === 'true';

  const statisticsConsent = useGroupConsent('statistics');

  useEffect(() => {
    if (
      MATOMO_ENABLED === 'true' &&
      MATOMO_URL &&
      MATOMO_SITE_ID &&
      statisticsConsent
    ) {
      init({
        jsTrackerFile: MATOMO_JS_TRACKER_FILE,
        phpTrackerFile: MATOMO_PHP_TRACKER_FILE,
        url: MATOMO_URL,
        siteId: MATOMO_SITE_ID,
      });
    }
  }, [statisticsConsent]);

  return (
    <div
      className={classNames(styles.pageLayout, {
        [styles.pageLayoutWithoutHeader]: isIframe,
      })}
    >
      {!isIframe && <Header />}
      <div className={styles.pageBody}>{children}</div>
      {!isIframe && <Footer />}
    </div>
  );
};

export default PageLayout;
