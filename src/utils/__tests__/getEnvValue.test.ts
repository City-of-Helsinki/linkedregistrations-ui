import { describe, expect, it, vi } from 'vitest';

import getEnvValue from '../getEnvValue';

const windowWithEnv = () => window;

const TEST_KEY = 'TEST_ENV_UTILS_VALUE';

const setRuntimeEnv = (value: unknown) => {
  windowWithEnv()._env_ = {
    [TEST_KEY]: value,
  };
};

describe('getEnvValue', () => {
  const runtimeEnvBackup = windowWithEnv()._env_;

  afterEach(() => {
    windowWithEnv()._env_ = runtimeEnvBackup;
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    delete process.env[TEST_KEY];
  });

  it.each([
    [123, '123'],
    [true, 'true'],
    [BigInt(9007199254740991), '9007199254740991'],
    ['test-value', 'test-value'],
  ])('coerces runtime-injected value %s to string %s', (input, expected) => {
    setRuntimeEnv(input);

    expect(getEnvValue(TEST_KEY)).toBe(expected);
  });

  it('skips runtime env object value and falls back to next source', () => {
    setRuntimeEnv({ nested: true });
    vi.stubEnv(TEST_KEY, 'from-process-env');

    expect(getEnvValue(TEST_KEY)).toBe('from-process-env');
  });

  it('falls back to process.env when runtime env value is missing', () => {
    windowWithEnv()._env_ = {};
    vi.stubEnv(TEST_KEY, 'from-process-env');

    expect(getEnvValue(TEST_KEY)).toBe('from-process-env');
  });

  it('returns undefined when key is missing from all sources', () => {
    windowWithEnv()._env_ = {};

    expect(getEnvValue(TEST_KEY)).toBeUndefined();
  });

  it('logs a warning when window._env_ is undefined', () => {
    const originalGlobalWarn = globalThis.console.warn;
    const warnSpy = vi.fn();
    globalThis.console.warn = warnSpy;
    vi.stubGlobal('window', { _env_: undefined });

    getEnvValue(TEST_KEY);

    expect(warnSpy).toHaveBeenCalledWith(
      'Warning: window._env_ is undefined. The env-config.js script may not have loaded successfully.'
    );

    globalThis.console.warn = originalGlobalWarn;
  });

  it('does not warn when window._env_ is defined but key is missing', () => {
    const originalGlobalWarn = globalThis.console.warn;
    const originalWindowWarn = window.console.warn;
    const warnSpy = vi.fn();
    globalThis.console.warn = warnSpy;
    window.console.warn = warnSpy;
    windowWithEnv()._env_ = {};

    getEnvValue(TEST_KEY);

    expect(warnSpy).not.toHaveBeenCalled();

    globalThis.console.warn = originalGlobalWarn;
    window.console.warn = originalWindowWarn;
  });
});
