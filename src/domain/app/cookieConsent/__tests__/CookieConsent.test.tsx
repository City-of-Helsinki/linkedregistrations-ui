/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable max-len */

import { CookieConsentContextProvider } from 'hds-react';
import i18n from 'i18next';
import React from 'react';
import { screen as shadowScreen } from 'shadow-dom-testing-library';

import useCookieConsentSettings from '../../../../hooks/useCookieConsentSettings';
import {
  configure,
  render,
  userEvent,
  waitFor,
  within,
} from '../../../../utils/testUtils';
import CookieConsent from '../CookieConsent';

jest.mock('next/dist/client/router', () => require('next-router-mock'));

configure({ defaultHidden: true });

const clearAllCookies = () =>
  document.cookie.split(';').forEach((c) => {
    document.cookie =
      c.trim().split('=')[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;';
  });

const realDateNow = Date.now.bind(global.Date);

beforeAll(() => {
  const dateNowStub = jest.fn(() => 1530518207007);
  global.Date.now = dateNowStub;
});

beforeEach(() => {
  jest.clearAllMocks();

  global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));

  clearAllCookies();
  i18n.changeLanguage('fi');
});

afterAll(() => {
  global.Date.now = realDateNow;
});

const TestMockApp = () => {
  const cookieConsentProps = useCookieConsentSettings();

  return (
    <CookieConsentContextProvider {...cookieConsentProps}>
      <p data-testid="cookie-consent-context-is-ready">Context is ready</p>
      <CookieConsent />
    </CookieConsentContextProvider>
  );
};

const renderApp = async () => render(<TestMockApp />);

const acceptAllCookieText =
  'helfi-cookie-consents=%7B%22groups%22%3A%7B%22essential%22%3A%7B%22checksum%22%3A%22b50db787%22%2C%22timestamp%22%3A1530518207007%7D%2C%22tunnistamo%22%3A%7B%22checksum%22%3A%22ea5a1519%22%2C%22timestamp%22%3A1530518207007%7D%2C%22signupForm%22%3A%7B%22checksum%22%3A%2272c3440b%22%2C%22timestamp%22%3A1530518207007%7D%2C%22shared%22%3A%7B%22checksum%22%3A%2288facd92%22%2C%22timestamp%22%3A1530518207007%7D%2C%22statistics%22%3A%7B%22checksum%22%3A%22caa20391%22%2C%22timestamp%22%3A1530518207007%7D%7D%7D';
const acceptOnlyNecessaryCookieText =
  'helfi-cookie-consents=%7B%22groups%22%3A%7B%22essential%22%3A%7B%22checksum%22%3A%22b50db787%22%2C%22timestamp%22%3A1530518207007%7D%2C%22tunnistamo%22%3A%7B%22checksum%22%3A%22ea5a1519%22%2C%22timestamp%22%3A1530518207007%7D%2C%22signupForm%22%3A%7B%22checksum%22%3A%2272c3440b%22%2C%22timestamp%22%3A1530518207007%7D%2C%22shared%22%3A%7B%22checksum%22%3A%2288facd92%22%2C%22timestamp%22%3A1530518207007%7D%7D%7D';

const findCookieConsentModal = async () => {
  const regions = await shadowScreen.findAllByShadowRole('region');

  const container = regions.find(
    (region) => region.getAttribute('id') === 'hds-cc'
  );

  return container as HTMLElement;
};

const waitCookieConsentModalToBeVisible = async () => {
  const cookieConsentModal = await findCookieConsentModal();

  await within(cookieConsentModal).findByRole('heading', {
    name: 'Linked Registrations käyttää evästeitä',
  });

  return cookieConsentModal;
};

const waitCookieConsentModalToBeHidden = async () => {
  await waitFor(() =>
    expect(shadowScreen.queryAllByRole('region')).toHaveLength(0)
  );
};

const findCookieConsentModalElement = async (
  cookieConsentModal: HTMLElement,
  key:
    | 'acceptAllButton'
    | 'acceptOnlyNecessaryButton'
    | 'enOption'
    | 'fiOption'
    | 'languageSelector'
    | 'svOption'
) => {
  switch (key) {
    case 'acceptAllButton':
      return within(cookieConsentModal).findByRole('button', {
        name: 'Hyväksy kaikki evästeet',
      });
    case 'acceptOnlyNecessaryButton':
      return within(cookieConsentModal).findByRole('button', {
        name: 'Hyväksy vain välttämättömät evästeet',
      });
    case 'enOption':
      return within(cookieConsentModal).findByRole('link', {
        name: 'English (EN)',
      });
    case 'fiOption':
      return within(cookieConsentModal).findByRole('link', {
        name: 'Suomeksi (FI)',
      });
    case 'languageSelector':
      return within(cookieConsentModal).findByRole('button', {
        name: /Vaihda kieli. Change language. Ändra språk./i,
      });
    case 'svOption':
      return within(cookieConsentModal).findByRole('link', {
        name: 'Svenska (SV)',
      });
  }
};

it('should show cookie consent modal if consent is not saved to cookie', async () => {
  renderApp();

  await waitCookieConsentModalToBeVisible();
});

it('should store consent to cookie when clicking accept all button', async () => {
  const user = userEvent.setup();

  renderApp();

  const cookieConsentModal = await waitCookieConsentModalToBeVisible();
  const acceptAllButton = await findCookieConsentModalElement(
    cookieConsentModal,
    'acceptAllButton'
  );

  await user.click(acceptAllButton);

  expect(document.cookie).toEqual(expect.stringContaining(acceptAllCookieText));
  await waitCookieConsentModalToBeHidden();
});

it('should store consent to cookie when clicking accept only necessary button', async () => {
  const user = userEvent.setup();

  renderApp();

  const cookieConsentModal = await waitCookieConsentModalToBeVisible();

  const acceptOnlyNecessaryButton = await findCookieConsentModalElement(
    cookieConsentModal,
    'acceptOnlyNecessaryButton'
  );

  await user.click(acceptOnlyNecessaryButton);

  expect(document.cookie).toEqual(
    expect.stringContaining(acceptOnlyNecessaryCookieText)
  );
  await waitCookieConsentModalToBeHidden();
});

it('should not show cookie consent modal if consent is saved', async () => {
  document.cookie = acceptAllCookieText;

  renderApp();

  await waitCookieConsentModalToBeHidden();
});
