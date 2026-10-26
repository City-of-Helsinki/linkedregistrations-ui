/* eslint-disable @typescript-eslint/no-empty-object-type, @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { AxeMatchers } from 'vitest-axe/matchers';

declare module '@vitest/expect' {
  export interface Assertion<T = any> extends AxeMatchers {}
}

declare module 'vitest' {
  export interface AsymmetricMatchersContaining extends AxeMatchers {}
}

declare global {
  namespace jest {
    interface Matchers<R, T = {}> extends AxeMatchers {}
  }
}
