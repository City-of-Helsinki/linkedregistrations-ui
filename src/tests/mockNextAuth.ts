import { ExtendedSession } from '../types';

// Reference: https://github.com/nextauthjs/next-auth/issues/4866

export const mockSession = {
  expires: new Date(Date.now() + 2 * 86400).toISOString(),
  user: { name: 'admin' },
};

jest.mock('next-auth/react', () => {
  const originalModule = jest.requireActual('next-auth/react');

  return {
    __esModule: true,
    ...originalModule,
    useSession: jest.fn(() => ({
      data: mockSession,
      status: 'authenticated',
    })),
  };
});
// Reference: https://github.com/nextauthjs/next-auth/discussions/4185#discussioncomment-2397318
// We also need to mock the whole next-auth package, since it's used in
// our various pages via the `export { getServerSideProps }` function.
jest.mock('next-auth/next', () => ({
  __esModule: true,
  default: jest.fn(),
  getServerSession: jest.fn(
    () =>
      new Promise((resolve) => {
        resolve({
          accessToken: undefined,
          accessTokenExpiresAt: null,
          apiToken: null,
          apiTokenExpiresAt: null,
          expires: '',
          sub: null,
        } as ExtendedSession);
      })
  ),
}));
