/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-console */
import { ParsedUrlQuery } from 'querystring';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  act,
  fireEvent,
  render,
  RenderResult,
  screen,
  waitFor,
} from '@testing-library/react';
import { RequestHandler } from 'msw';
import { RouterContext } from 'next/dist/shared/lib/router-context.shared-runtime';
import { NextRouter } from 'next/router';
import { SessionProvider } from 'next-auth/react';
import React, { useMemo } from 'react';
import wait from 'waait';

import { AccessibilityNotificationProvider } from '../common/components/accessibilityNotificationContext/AccessibilityNotificationContext';
import { testId } from '../common/components/loadingSpinner/LoadingSpinner';
import { NotificationsProvider } from '../common/components/notificationsContext/NotificationsContext';
import { registration } from '../domain/registration/__mocks__/registration';
import { SignupGroupFormProvider } from '../domain/signupGroup/signupGroupFormContext/SignupGroupFormContext';
import { server } from '../tests/msw/server';
import { ExtendedSession } from '../types';

export const arrowUpKeyPressHelper = (): boolean =>
  fireEvent.keyDown(document, { code: 38, key: 'ArrowUp' });

export const arrowDownKeyPressHelper = (): boolean =>
  fireEvent.keyDown(document, { code: 40, key: 'ArrowDown' });

export const enterKeyPressHelper = (): boolean =>
  fireEvent.keyDown(document, { code: 13, key: 'Enter' });

export const escKeyPressHelper = (): boolean =>
  fireEvent.keyDown(document, { code: 27, key: 'Escape' });

export const tabKeyPressHelper = (el?: HTMLElement): boolean =>
  fireEvent.keyDown(el ?? document, { code: 9, key: 'Tab' });

const customRender: CustomRender = (
  ui,
  { path = '/', query = {}, router = {}, session = null } = {}
) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    const value = useMemo(
      () => ({
        ...mockRouter,
        ...router,
        ...(path ? { pathname: path, asPath: path, basePath: path } : {}),
        ...(query ? { query } : {}),
      }),
      []
    );

    return (
      <AccessibilityNotificationProvider>
        <NotificationsProvider>
          <RouterContext.Provider value={value}>
            <SessionProvider session={session}>
              {/* @ts-ignore */}
              <QueryClientProvider client={queryClient}>
                {children as React.ReactElement}
              </QueryClientProvider>
            </SessionProvider>
          </RouterContext.Provider>
        </NotificationsProvider>
      </AccessibilityNotificationProvider>
    );
  };

  const renderResult = render(ui, { wrapper: Wrapper });
  return { ...renderResult };
};
const mockRouter: NextRouter = {
  basePath: '',
  pathname: '/',
  route: '/',
  asPath: '/',
  query: {},
  back: jest.fn(() => Promise.resolve(true)),
  beforePopState: jest.fn(() => Promise.resolve(true)),
  forward: jest.fn(() => Promise.resolve(true)),
  prefetch: jest.fn(() => Promise.resolve()),
  push: jest.fn(() => Promise.resolve(true)),
  replace: jest.fn(() => Promise.resolve(true)),
  reload: jest.fn(() => Promise.resolve(true)),
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
  isFallback: false,
  isLocaleDomain: false,
  isReady: true,
  isPreview: false,
};

export type CustomRenderOptions = {
  path?: string;
  query?: ParsedUrlQuery;
  session?: ExtendedSession | null;
  router?: Partial<NextRouter>;
};

type CustomRender = {
  (ui: React.ReactElement, options?: CustomRenderOptions): CustomRenderResult;
};

export const setQueryMocks = (...handlers: RequestHandler[]): void => {
  server.use(...handlers);
};

export const getQueryWrapper = (session: ExtendedSession | null = null) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <SessionProvider session={session}>
      <SignupGroupFormProvider registration={registration}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </SignupGroupFormProvider>
    </SessionProvider>
  );

  return wrapper;
};

type CustomRenderResult = RenderResult;

const actWait = (amount?: number): Promise<void> => act(() => wait(amount));

const loadingSpinnerIsNotInDocument = async (timeout = 1000): Promise<void> =>
  waitFor(
    () => {
      expect(screen.queryAllByTestId(testId)).toHaveLength(0);
    },
    { timeout }
  );

// eslint-disable-next-line import/export
export { actWait, customRender as render, loadingSpinnerIsNotInDocument };

// re-export everything
// eslint-disable-next-line import/export
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
