/* eslint-disable @typescript-eslint/no-explicit-any */
import { useTranslation } from 'next-i18next/pages';
import React, { FC, PropsWithChildren, useCallback, useMemo } from 'react';

import { ServerErrorItem } from '../../../types';

import {
  parseSeatsReservationServerErrors,
  parseSignupGroupServerErrors,
} from './utils';

type ShowServerErrorsFnParams = {
  error: any;
};

type RequestType = 'seatsReservation' | 'signup';

export type SignupServerErrorsContextProps = {
  serverErrorItems: ServerErrorItem[];
  setServerErrorItems: (items: ServerErrorItem[]) => void;
  showServerErrors: (
    params: ShowServerErrorsFnParams,
    type: RequestType
  ) => void;
};

export const SignupServerErrorsContext = React.createContext<
  SignupServerErrorsContextProps | undefined
>(undefined);

export const SignupServerErrorsProvider: FC<PropsWithChildren> = ({
  children,
}) => {
  const { t } = useTranslation('signup');

  const [serverErrorItems, setServerErrorItems] = React.useState<
    ServerErrorItem[]
  >([]);

  const showServerErrors = useCallback(
    ({ error }: ShowServerErrorsFnParams, type: RequestType) => {
      /* istanbul ignore else */
      if (error) {
        switch (type) {
          case 'seatsReservation':
            setServerErrorItems(
              parseSeatsReservationServerErrors({ error, t })
            );
            break;
          case 'signup':
            setServerErrorItems(parseSignupGroupServerErrors({ error, t }));
            break;
        }
      }
    },
    [t]
  );

  const value = useMemo(
    () => ({
      serverErrorItems,
      setServerErrorItems,
      showServerErrors,
    }),
    [serverErrorItems, showServerErrors]
  );
  return (
    <SignupServerErrorsContext.Provider value={value}>
      {children}
    </SignupServerErrorsContext.Provider>
  );
};
