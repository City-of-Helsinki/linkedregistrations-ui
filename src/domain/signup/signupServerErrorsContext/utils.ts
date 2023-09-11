import { TFunction } from 'i18next';

import { LEServerError, ServerErrorItem } from '../../../types';
import parseServerErrorMessage from '../../../utils/parseServerErrorMessage';
import pascalCase from '../../../utils/pascalCase';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ErrorObject = Record<string, any>;
type ErrorType = ErrorObject | ErrorObject[] | string;

export const parseSignupGroupServerErrors = ({
  error,
  t,
}: {
  error: ErrorType;
  t: TFunction;
}): ServerErrorItem[] => {
  // LE returns errors as array when trying to create/edit multiple signup in same request.
  // In that case call parseSignupGroupServerErrors recursively to get all single errors
  if (Array.isArray(error)) {
    return (error as ErrorObject[]).reduce(
      (previous: ServerErrorItem[], r: ErrorType) => [
        ...previous,
        ...parseSignupGroupServerErrors({ error: r, t }),
      ],
      []
    );
  }

  return typeof error === 'string'
    ? [{ label: '', message: parseServerErrorMessage({ error: [error], t }) }]
    : Object.entries(error).reduce(
        (previous: ServerErrorItem[], [key, error]) => [
          ...previous,
          ...parseSignupGroupServerError({ error, key }),
        ],
        []
      );

  // Get error item for an single error.
  function parseSignupGroupServerError({
    error,
    key,
  }: {
    error: LEServerError;
    key: string;
  }) {
    if (key === 'signups') {
      return parseSignupServerError(error);
    }

    return [
      {
        label: parseSignupGroupServerErrorLabel({ key }),
        message: parseServerErrorMessage({ error, t }),
      },
    ];
  }

  // Get error items for video fields
  function parseSignupServerError(error: LEServerError): ServerErrorItem[] {
    /* istanbul ignore else */
    if (Array.isArray(error)) {
      return Object.entries(error[0]).reduce(
        (previous: ServerErrorItem[], [key, e]) => [
          ...previous,
          {
            label: parseSignupGroupServerErrorLabel({ key }),
            message: parseServerErrorMessage({ error: e as string[], t }),
          },
        ],
        []
      );
    } else {
      return [];
    }
  }

  // Get correct field name for an error item
  function parseSignupGroupServerErrorLabel({ key }: { key: string }): string {
    switch (key) {
      case 'detail':
      case 'non_field_errors':
        return '';
      default:
        return t(`signup:label${pascalCase(key)}`);
    }
  }
};

export const parseSeatsReservationServerErrors = ({
  error,
  t,
}: {
  error: ErrorType;
  t: TFunction;
}): ServerErrorItem[] => {
  if (Array.isArray(error)) {
    return (error as ErrorObject[]).reduce(
      (previous: ServerErrorItem[], r: ErrorType) => [
        ...previous,
        ...parseSeatsReservationServerErrors({ error: r, t }),
      ],
      []
    );
  }

  return typeof error === 'string'
    ? [{ label: '', message: parseServerErrorMessage({ error: [error], t }) }]
    : Object.entries(error).reduce(
        (previous: ServerErrorItem[], [key, error]) => [
          ...previous,
          ...parseSeatsReservationServerError({ error, key }),
        ],
        []
      );

  // Get correct field name for an error item
  function parseSeatsReservationServerErrorLabel({
    key,
  }: {
    key: string;
  }): string {
    return key === 'seats' ? '' : key;
  }
  // Get error item for an single error.
  function parseSeatsReservationServerError({
    error,
    key,
  }: {
    error: LEServerError;
    key: string;
  }) {
    return [
      {
        label: parseSeatsReservationServerErrorLabel({ key }),
        message: parseServerErrorMessage({ error, t }),
      },
    ];
  }
};
