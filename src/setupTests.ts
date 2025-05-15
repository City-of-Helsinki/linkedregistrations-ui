/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import '@testing-library/jest-dom';
import 'jest-localstorage-mock';
import './tests/initI18n';
import { webcrypto } from 'crypto';
import { TextEncoder } from 'node:util';

import { toHaveNoViolations } from 'jest-axe';
import { setConfig } from 'next/config';

import config from '../next.config';

import { server } from './tests/msw/server';

setConfig(config);

expect.extend(toHaveNoViolations);

// Mock scrollTo function
window.scrollTo = jest.fn();

const originalWarn = console.warn.bind(console.warn);

console.warn = (msg: any, ...optionalParams: any[]) => {
  const msgStr = msg.toString();

  return (
    !msgStr.includes(
      'Using ReactElement as a label is against good usability and accessibility practices.'
    ) &&
    !msgStr.match(
      /Could not find the stylesheet to update with the ".*" selector!/i
    ) &&
    originalWarn(msg, ...optionalParams)
  );
};

const originalError = console.error.bind(console.error);

console.error = (msg: any, ...optionalParams: any[]) => {
  const msgStr = msg.toString();

  return (
    !msgStr.includes('Could not parse CSS stylesheet') &&
    originalError(msg, ...optionalParams)
  );
};

beforeAll(() => {
  server.listen();

  global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));

  global.TextEncoder = TextEncoder;

  Object.defineProperties(global, {
    crypto: { value: webcrypto, writable: true },
  });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

jest.setTimeout(1000000);

process.env.NEXT_PUBLIC_WEB_STORE_INTEGRATION_ENABLED = 'true';

// Mock Sentry
jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn(),
  withSentryConfig: jest.fn((config) => config)
}));
jest.mock('@sentry/browser', () => ({
  captureException: jest.fn(),
}));
