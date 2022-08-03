/* eslint-disable import/no-named-as-default-member */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
import i18n from 'i18next';
import mockRouter from 'next-router-mock';
import React from 'react';

import {
  configure,
  render,
  screen,
  userEvent,
  waitFor,
} from '../../../../utils/testUtils';
import Header from '../Header';

configure({ defaultHidden: true });

jest.mock('next/dist/client/router', () => require('next-router-mock'));

beforeEach(() => {
  jest.restoreAllMocks();
  mockRouter.setCurrentUrl('');
  i18n.changeLanguage('fi');
});

const renderComponent = () => render(<Header />);

const getElement = (key: 'enOption' | 'menuButton' | 'svOption') => {
  switch (key) {
    case 'enOption':
      return screen.getByRole('link', {
        hidden: false,
        name: /In English/i,
      });
    case 'svOption':
      return screen.getByRole('link', {
        hidden: false,
        name: /På svenska/i,
      });
    case 'menuButton':
      return screen.getByRole('button', {
        name: 'Valikko',
      });
  }
};

const getElements = (key: 'appName' | 'languageSelector') => {
  switch (key) {
    case 'appName':
      return screen.getAllByRole('link', {
        name: /linked registrations/i,
      });
    case 'languageSelector':
      return screen.getAllByRole('button', {
        name: /suomi - kielivalikko/i,
      });
  }
};

test('should route to home page by clicking application name', async () => {
  const user = userEvent.setup();

  mockRouter.setCurrentUrl('/registrations');
  renderComponent();
  expect(mockRouter.asPath).toBe('/registrations');

  const appName = getElements('appName')[0];
  await user.click(appName);

  expect(mockRouter.asPath).toBe('/fi');
});

test('should show mobile menu', async () => {
  const user = userEvent.setup();
  global.innerWidth = 500;
  renderComponent();

  expect(document.querySelector('#hds-mobile-menu')).not.toBeInTheDocument();
  const menuButton = getElement('menuButton');
  await user.click(menuButton);

  await waitFor(() =>
    expect(document.querySelector('#hds-mobile-menu')).toBeInTheDocument()
  );
});

test('should change language', async () => {
  const user = userEvent.setup();
  renderComponent();

  const languageSelector = getElements('languageSelector')[0];
  await user.click(languageSelector);

  const enOption = getElement('enOption');
  await user.click(enOption);
  expect(mockRouter.locale).toBe('en');

  await user.click(languageSelector);

  const svOption = getElement('svOption');
  await user.click(svOption);
  expect(mockRouter.locale).toBe('sv');
});
