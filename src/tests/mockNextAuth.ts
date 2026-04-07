import { ExtendedSession } from '../types';
import { fakeAuthenticatedSession } from '../utils/mockSession';

// Reference: https://github.com/nextauthjs/next-auth/issues/4866

export const mockSession = fakeAuthenticatedSession();

vi.mock('next-auth/react', async () => {
  const originalModule = await vi.importActual('next-auth/react');

  return {
    __esModule: true,
    ...originalModule,
    useSession: vi.fn(() => ({
      data: mockSession,
      status: 'authenticated',
    })),
  };
});
// Reference: https://github.com/nextauthjs/next-auth/discussions/4185#discussioncomment-2397318
// We also need to mock the whole next-auth package, since it's used in
// our various pages via the `export { getServerSideProps }` function.
vi.mock('next-auth/next', async () => {
  const originalModule = await vi.importActual('next-auth/next');

  return {
    ...originalModule,
    default: vi.fn(),
    getServerSession: vi.fn(() =>
      Promise.resolve({
        accessToken: undefined,
        accessTokenExpiresAt: null,
        apiToken: null,
        apiTokenExpiresAt: null,
        expires: '',
        sub: null,
      } as ExtendedSession)
    ),
  };
});

vi.mock('next-auth', async () => {
  const originalModule = await vi.importActual('next-auth');

  return {
    ...originalModule,
    getServerSession: vi.fn(() =>
      Promise.resolve({
        accessToken: undefined,
        accessTokenExpiresAt: null,
        apiToken: null,
        apiTokenExpiresAt: null,
        expires: '',
        sub: null,
      } as ExtendedSession)
    ),
  };
});
