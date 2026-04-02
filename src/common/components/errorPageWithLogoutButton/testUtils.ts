import * as nextAuth from 'next-auth/react';

import { screen, userEvent } from '../../../utils/testUtils';

const getSignOutButton = () => {
  return screen.getByRole('button', { name: /kirjaudu ulos/i });
};

export const shouldRenderErrorPageTexts = async ({
  text,
  title,
}: {
  text: string;
  title: string;
}) => {
  expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
  expect(screen.getByText(text)).toBeInTheDocument();
};

export const shouldSignOut = async () => {
  const user = userEvent.setup();
  vi.spyOn(nextAuth, 'signOut').mockResolvedValue({ url: 'https://test.com' });

  const signoutButton = getSignOutButton();
  await user.click(signoutButton);

  expect(nextAuth.signOut).toBeCalled();
};
