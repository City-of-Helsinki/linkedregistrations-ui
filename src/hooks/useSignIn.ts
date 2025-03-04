import { signIn } from 'next-auth/react';

import useLocale from './useLocale';

const useSignIn = (extraSignInParams?: Record<string, string>) => {
  const locale = useLocale();

  const handleSignIn = async () => {
    signIn('tunnistamo', undefined, { ui_locales: locale, ...extraSignInParams ?? {} });
  };

  return { handleSignIn };
};

export default useSignIn;
