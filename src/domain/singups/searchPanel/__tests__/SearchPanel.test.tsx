/* eslint-disable @typescript-eslint/no-require-imports */
import { NextParsedUrlQuery } from 'next/dist/server/request-meta';
import singletonRouter from 'next/router';
import mockRouter from 'next-router-mock';
import React from 'react';

import {
  configure,
  fireEvent,
  render,
  screen,
  userEvent,
  waitFor,
} from '../../../../utils/testUtils';
import { ROUTES } from '../../../app/routes/constants';
import { TEST_REGISTRATION_ID } from '../../../registration/constants';
import SearchPanel from '../SearchPanel';

jest.mock('next/dist/client/router', () => require('next-router-mock'));

configure({ defaultHidden: true });

const getElement = (key: 'searchInput') => {
  switch (key) {
    case 'searchInput':
      return screen.getByRole('combobox', {
        name: /hae osallistujia/i,
      });
  }
};

const pushSignupsRoute = (query?: NextParsedUrlQuery) => {
  singletonRouter.push({
    pathname: ROUTES.SIGNUPS,
    query: { ...query, registrationId: TEST_REGISTRATION_ID },
  });
};

const renderComponent = () => render(<SearchPanel />);

test('should initialize search panel input', async () => {
  const searchValue = 'search';
  pushSignupsRoute({ text: searchValue });
  renderComponent();

  const searchInput = getElement('searchInput');
  await waitFor(() => expect(searchInput).toHaveValue(searchValue));
});

test('should search signups with correct search params', async () => {
  const values = { text: 'search' };
  const user = userEvent.setup();

  pushSignupsRoute();
  renderComponent();

  // Text filtering
  const searchInput = getElement('searchInput');
  fireEvent.change(searchInput, { target: { value: values.text } });
  await waitFor(() => expect(searchInput).toHaveValue(values.text));

  const searchButton = screen.getAllByRole('button', {
    name: /etsi osallistujia/i,
  })[1];
  await user.click(searchButton);

  await waitFor(() =>
    expect(decodeURIComponent(mockRouter.asPath)).toBe(
      `/registration/${TEST_REGISTRATION_ID}/signup?text=search`
    )
  );
});
