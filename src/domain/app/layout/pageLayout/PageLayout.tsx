import { init } from '@socialgouv/matomo-next';
import classNames from 'classnames';
import { useGroupConsent } from 'hds-react';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

import getEnvValue from '../../../../utils/getEnvValue';
import { SIGNUP_QUERY_PARAMS } from '../../../signup/constants';
import Footer from '../../footer/Footer';
import Header from '../../header/Header';

import styles from './pageLayout.module.scss';

const getMatomoConfig = () => {
  return {
    enabled: getEnvValue('NEXT_PUBLIC_MATOMO_ENABLED'),
    url: getEnvValue('NEXT_PUBLIC_MATOMO_URL'),
    siteId: getEnvValue('NEXT_PUBLIC_MATOMO_SITE_ID'),
    jsTrackerFile: getEnvValue('NEXT_PUBLIC_MATOMO_JS_TRACKER_FILE'),
    phpTrackerFile: getEnvValue('NEXT_PUBLIC_MATOMO_PHP_TRACKER_FILE'),
  };
};

const PageLayout: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => {
  const {
    query: { [SIGNUP_QUERY_PARAMS.IFRAME]: iframe },
  } = useRouter();
  const isIframe = iframe === 'true';

  const statisticsConsent = useGroupConsent('statistics');

  useEffect(() => {
    const { enabled, url, siteId, jsTrackerFile, phpTrackerFile } =
      getMatomoConfig();

    if (enabled === 'true' && url && siteId && statisticsConsent) {
      init({
        jsTrackerFile,
        phpTrackerFile,
        url,
        siteId,
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
