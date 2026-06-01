/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import '@testing-library/jest-dom/vitest';
import './tests/initI18n';
import { webcrypto } from 'crypto';
import { TextEncoder } from 'node:util';

// Polyfill Blob.prototype.stream for jsdom, which lacks it.
// MSW's XHR interceptor creates a jsdom Blob for responseType: 'blob',
// then passes it to Node's native Response constructor, which calls
// blob.stream() via undici's extractBody — causing a TypeError.
if (typeof Blob !== 'undefined' && !Blob.prototype.stream) {
  Blob.prototype.stream = function () {
    return new ReadableStream({
      start: async (controller) => {
        // @ts-expect-error 'this' implicitly has type 'any' because it does not have a type annotation.
        controller.enqueue(new Uint8Array(await this.arrayBuffer()));
        controller.close();
      },
    });
  } as () => ReadableStream;
}

import { expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import * as matchers from 'vitest-axe/matchers';

import { server } from './tests/msw/server';

expect.extend(matchers);

// Mock scrollTo function
window.scrollTo = vi.fn();

// Mock localStorage and sessionStorage with vi.fn() so tests can use mockReturnValueOnce etc.
const createStorageMock = () => {
  const store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach((key) => delete store[key]);
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  };
};

Object.defineProperty(window, 'localStorage', { value: createStorageMock() });
Object.defineProperty(window, 'sessionStorage', { value: createStorageMock() });

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
    !msgStr.includes(
      'Warning: window._env_ is undefined. The env-config.js script may not have loaded successfully.'
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

  // Wrap MSW's fetch interceptor to handle relative URLs (e.g. /api/auth/_log
  // from next-auth logger). Must be applied AFTER server.listen() so it wraps
  // MSW's interceptor — otherwise MSW replaces our wrapper and creates
  // new Request(relativeUrl) internally, which crashes in Node.
  const mswFetch = globalThis.fetch;
  globalThis.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    if (typeof input === 'string' && input.startsWith('/')) {
      return Promise.resolve(
        new Response(JSON.stringify({}), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );
    }
    return mswFetch(input, init);
  };

  global.ResizeObserver = class {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  };

  global.TextEncoder = TextEncoder as typeof globalThis.TextEncoder;

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

process.env.NEXT_PUBLIC_WEB_STORE_INTEGRATION_ENABLED = 'true';

// Mock Sentry
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
  withSentryConfig: vi.fn((config) => config),
}));
vi.mock('@sentry/browser', () => ({
  captureException: vi.fn(),
}));
