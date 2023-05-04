/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import '@testing-library/jest-dom/extend-expect';
import 'jest-localstorage-mock';
import './tests/initI18n';
import { toHaveNoViolations } from 'jest-axe';
import { setConfig } from 'next/config';

import config from '../next.config';
import { server } from './tests/msw/server';

setConfig(config);

expect.extend(toHaveNoViolations);

// Mock scrollTo function
window.scrollTo = jest.fn();

const originalWarn = console.warn.bind(console.warn);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

beforeAll(() => {
  server.listen();
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

jest.setTimeout(1000000);
