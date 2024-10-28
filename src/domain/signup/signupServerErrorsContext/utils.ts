import { TFunction } from 'i18next';

import { LEServerError, ServerErrorItem } from '../../../types';
import parseServerErrorLabel from '../../../utils/parseServerErrorLabel';
import parseServerErrorMessage from '../../../utils/parseServerErrorMessage';
import pascalCase from '../../../utils/pascalCase';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ErrorObject = Record<string, any>;
type ErrorType = ErrorObject | ErrorObject[] | string;

const isContactPersonObjectError = ({
  error,
  key,
}: {
  error: LEServerError;
  key: string;
}) =>
  key === 'contact_person' &&
  // API returns '{contact_person: ["Tämän kentän arvo ei voi olla "null"."]}' error when
  // trying to set null value for contact_person. Use parseContactPersonServerError only
  // when error type is object
  !(Array.isArray(error) && typeof error[0] === 'string');

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
    if (isContactPersonObjectError({ key, error })) {
      return parseContactPersonObjectServerError(error);
    }
    if (key === 'signups') {
      return parseSignupServerError(error);
    }

    return [
      {
        label: parseServerErrorLabel({
          key,
          parseFn: parseSignupGroupServerErrorLabel,
        }),
        message: parseServerErrorMessage({ error, t }),
      },
    ];
  }

  // Get error items for contact person fields
  function parseContactPersonObjectServerError(
    error: LEServerError
  ): ServerErrorItem[] {
    return Object.entries(error).reduce(
      (previous: ServerErrorItem[], [key, e]) => [
        ...previous,
        {
          label: parseServerErrorLabel({
            key,
            parseFn: parseContactPersonServerErrorLabel,
          }),
          message: parseServerErrorMessage({ error: e as string[], t }),
        },
      ],
      []
    );
  }

  // Get error items for video fields
  function parseSignupServerError(error: LEServerError): ServerErrorItem[] {
    /* istanbul ignore else */
    if (Array.isArray(error)) {
      return Object.entries(error).reduce(
        (previous: ServerErrorItem[], [, e]) => {
          return [
            ...previous,
            ...Object.entries(e).map(([key, item]) => ({
              label: parseServerErrorLabel({
                key,
                parseFn: parseSignupGroupServerErrorLabel,
              }),
              message: parseServerErrorMessage({
                error: item as string[],
                t,
              }),
            })),
          ];
        },
        []
      );
    } else {
      return [];
    }
  }

  function parseContactPersonServerErrorLabel({
    key,
  }: {
    key: string;
  }): string {
    return t(`signup:contactPerson.label${pascalCase(key)}`);
  }

  // Get correct field name for an error item
  function parseSignupGroupServerErrorLabel({ key }: { key: string }): string {
    if (['contact_person', 'registration'].includes(key)) {
      return t(`signup:label${pascalCase(key)}`);
    }

    if (
      [
        'city',
        'date_of_birth',
        'extra_info',
        'first_name',
        'last_name',
        'phone_number',
        'price_group',
        'zip_code',
        'street_address',
      ].includes(key)
    ) {
      return t(`signup:signup.label${pascalCase(key)}`);
    }

    return '';
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
