/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  loadingSpinnerIsNotInDocument,
  screen,
  userEvent,
  waitFor,
  within,
} from '../../../utils/testUtils';
import { Registration } from '../../registration/types';

export const getSignupsPageElement = (
  key: 'menu' | 'searchInput' | 'toggle'
) => {
  switch (key) {
    case 'menu':
      return screen.getByRole('region', { name: /valinnat/i });
    case 'searchInput':
      return screen.getByRole('textbox', { name: 'Hae osallistujia' });
    case 'toggle':
      return screen.getByRole('button', { name: /valinnat/i });
  }
};

export const openSignupsPageMenu = async () => {
  const user = userEvent.setup();
  const toggleButton = getSignupsPageElement('toggle');
  await user.click(toggleButton);
  const menu = getSignupsPageElement('menu');

  return { menu, toggleButton };
};

export const shouldExportSignupsAsExcel = async (
  registration: Registration
) => {
  global.URL.createObjectURL = jest.fn(() => 'https://test.com');
  global.URL.revokeObjectURL = jest.fn();
  const user = userEvent.setup();

  await loadingSpinnerIsNotInDocument(10000);

  const link: any = { click: jest.fn(), remove: jest.fn() };

  const { menu } = await openSignupsPageMenu();
  const exportAsExcelButton = await within(menu).getByRole('button', {
    name: 'Lataa osallistujalista (Excel)',
  });

  // Mock document.createElement which is needed by downloadBlob. RenderComponent needs
  // createElement so do this after rendering components to avoid errors
  const createElement = document.createElement;
  document.createElement = jest.fn().mockImplementation(() => link);

  await user.click(exportAsExcelButton);

  await waitFor(() =>
    expect(link.download).toBe(`registered_persons_${registration.id}`)
  );
  expect(link.href).toBe('https://test.com');
  expect(link.click).toHaveBeenCalledTimes(1);
  // Restore original createElement to avoid unexpected side effects
  document.createElement = createElement;
};
