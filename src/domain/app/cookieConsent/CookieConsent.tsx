import { CookieBanner } from 'hds-react';
import React, { FC } from 'react';

const CookieConsent: FC = () => {
  // TODO: remove this when HDS CookieModal handles this itself
  // istanbul ignore next
  if (typeof document === 'undefined') {
    return null;
  }

  return <CookieBanner />;
};

export default CookieConsent;
