/* eslint-disable no-undef */
import { FormikProps, useFormikContext } from 'formik';
import * as React from 'react';
import { useDebouncedCallback } from 'use-debounce';

import useIsMounted from '../../../hooks/useIsMounted';

export interface PersistProps {
  debounceTime?: number;
  isSessionStorage?: boolean;
  name: string;
  restoringDisabled?: boolean;
  savingDisabled?: boolean;
}

const FormikPersist = ({
  debounceTime = 300,

  isSessionStorage = false,
  name,
  restoringDisabled,
  savingDisabled,
}: PersistProps): null => {
  const isMounted = useIsMounted();
  const isInitialized = React.useRef(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formik = useFormikContext<any>();

  const debouncedSaveForm = useDebouncedCallback(
    async (data: FormikProps<Record<string, unknown>>) => {
      /* istanbul ignore next */
      if (savingDisabled || !isMounted.current) return;

      if (isSessionStorage) {
        window.sessionStorage.setItem(name, JSON.stringify(data));
      } else {
        window.localStorage.setItem(name, JSON.stringify(data));
      }
    },
    debounceTime
  );

  const saveForm = (data: FormikProps<Record<string, unknown>>) => {
    debouncedSaveForm(data);
  };

  React.useEffect(() => {
    if (isInitialized.current) {
      saveForm(formik);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik]);

  React.useEffect(() => {
    let timeout: NodeJS.Timeout;

    const maybeState = isSessionStorage
      ? window.sessionStorage.getItem(name)
      : window.localStorage.getItem(name);

    if (!restoringDisabled && maybeState) {
      formik.setFormikState(JSON.parse(maybeState));

      // Validate form after setting state
      timeout = setTimeout(async () => {
        await formik.validateForm();
        isInitialized.current = true;
      }, 10);
    } else {
      isInitialized.current = true;
    }
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default FormikPersist;
