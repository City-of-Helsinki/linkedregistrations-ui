import * as Sentry from '@sentry/browser';
import { ErrorEvent, TransactionEvent } from '@sentry/types';
import { normalize } from '@sentry/utils';
import isObject from 'lodash/isObject';
import snakeCase from 'lodash/snakeCase';

// https://github.com/getsentry/sentry-python/blob/8094c9e4462c7af4d73bfe3b6382791f9949e7f0/sentry_sdk/scrubber.py#L14
const DEFAULT_DENYLIST = [
  // stolen from relay
  'password',
  'passwd',
  'secret',
  'api_key',
  'apikey',
  'auth',
  'credentials',
  'mysql_pwd',
  'privatekey',
  'private_key',
  'token',
  'ip_address',
  'session',
  // django
  'csrftoken',
  'sessionid',
  // wsgi
  'remote_addr',
  'x_csrftoken',
  'x_forwarded_for',
  'set_cookie',
  'cookie',
  'authorization',
  'x_api_key',
  'x_forwarded_for',
  'x_real_ip',
  // other common names used in the wild
  'aiohttp_session', // aiohttp
  'connect.sid', // Express
  'csrf_token', // Pyramid
  'csrf', // (this is a cookie name used in accepted answers on stack overflow)
  '_csrf', // Express
  '_csrf_token', // Bottle
  'PHPSESSID', // PHP
  '_session', // Sanic
  'symfony', // Symfony
  'user_session', // Vue
  '_xsrf', // Tornado
  'XSRF-TOKEN', // Angular, Laravel
];

const SENTRY_DENYLIST = [
  ...DEFAULT_DENYLIST,
  'access_code',
  'city',
  'date_of_birth',
  'email',
  'extra_info',
  'first_name',
  'last_name',
  'membership_number',
  'native_language',
  'phone_number',
  'postal_code',
  'service_language',
  'street_address',
  'user_email',
  'user_name',
  'user_phone_number',
  'zipcode',
];

export const cleanSensitiveData = (data: Record<string, unknown>) => {
  const normalized = normalize(data);

  Object.entries(normalized).forEach(([key, value]) => {
    if (
      SENTRY_DENYLIST.includes(key) ||
      SENTRY_DENYLIST.includes(snakeCase(key))
    ) {
      delete normalized[key];
    } else if (Array.isArray(value)) {
      normalized[key] = value.map((item) =>
        isObject(item)
          ? cleanSensitiveData(item as Record<string, unknown>)
          : item
      );
    } else if (isObject(value)) {
      normalized[key] = cleanSensitiveData(value as Record<string, unknown>);
    }
  });

  return normalized;
};

export const beforeSend = (event: ErrorEvent): ErrorEvent =>
  cleanSensitiveData(
    event as unknown as Record<string, unknown>
  ) as unknown as ErrorEvent;

export const beforeSendTransaction = (
  event: TransactionEvent
): TransactionEvent =>
  cleanSensitiveData(
    event as unknown as Record<string, unknown>
  ) as unknown as TransactionEvent;

const reportError = ({
  data,
  message,
}: {
  data: { error: Record<string, unknown> } & Record<string, unknown>;
  message: string;
}): string => {
  const { error, ...restData } = data;
  const reportObject = {
    extra: {
      data: {
        ...restData,
        currentUrl: window.location.href,
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        errorAsString: JSON.stringify(error),
      },
      level: 'error',
    },
  };

  return Sentry.captureException(message, reportObject);
};

export { reportError };
