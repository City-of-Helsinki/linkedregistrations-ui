import { mockDefaultConfig } from '../../../../utils/mockNextJsConfig';
import { fakeAuthenticatedSession } from '../../../../utils/mockSession';
import { TEST_API_TOKEN } from '../../../auth/constants';
import {
  callDelete,
  callGet,
  callPatch,
  callPost,
  callPut,
} from '../fetchClient';
import { FetchError } from '../fetchError';

const BASE_URL = 'https://linkedevents-backend:8000/v1';
const apiToken = TEST_API_TOKEN;

const mockOkFetch = () =>
  vi.fn().mockResolvedValue({
    ok: true,
    text: () => Promise.resolve('{}'),
  });

beforeAll(() => {
  mockDefaultConfig();
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('callDelete', () => {
  it('should call fetch delete without authorization header', async () => {
    const mockFetch = mockOkFetch();
    vi.stubGlobal('fetch', mockFetch);

    await callDelete({ session: null, url: '/test/' });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/test/`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
  });

  it('should call fetch delete with authorization header', async () => {
    const mockFetch = mockOkFetch();
    vi.stubGlobal('fetch', mockFetch);

    await callDelete({ session: fakeAuthenticatedSession(), url: '/test/' });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/test/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${apiToken}`,
      },
    });
  });
});

describe('callGet', () => {
  it('should call fetch get without authorization header', async () => {
    const mockFetch = mockOkFetch();
    vi.stubGlobal('fetch', mockFetch);

    await callGet({ session: null, url: '/test/' });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/test/`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
  });

  it('should call fetch get with authorization header', async () => {
    const mockFetch = mockOkFetch();
    vi.stubGlobal('fetch', mockFetch);

    await callGet({ session: fakeAuthenticatedSession(), url: '/test/' });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/test/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${apiToken}`,
      },
    });
  });
});

describe('callPatch', () => {
  it('should call fetch patch without authorization header', async () => {
    const mockFetch = mockOkFetch();
    vi.stubGlobal('fetch', mockFetch);

    await callPatch({ data: 'data', session: null, url: '/test/' });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/test/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: 'data',
    });
  });

  it('should call fetch patch with authorization header', async () => {
    const mockFetch = mockOkFetch();
    vi.stubGlobal('fetch', mockFetch);

    await callPatch({
      data: 'data',
      session: fakeAuthenticatedSession(),
      url: '/test/',
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/test/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${apiToken}`,
      },
      body: 'data',
    });
  });
});

describe('callPost', () => {
  it('should call fetch post without authorization header', async () => {
    const mockFetch = mockOkFetch();
    vi.stubGlobal('fetch', mockFetch);

    await callPost({ data: 'data', session: null, url: '/test/' });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/test/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'data',
    });
  });

  it('should call fetch post with authorization header', async () => {
    const mockFetch = mockOkFetch();
    vi.stubGlobal('fetch', mockFetch);

    await callPost({
      data: 'data',
      session: fakeAuthenticatedSession(),
      url: '/test/',
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/test/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${apiToken}`,
      },
      body: 'data',
    });
  });
});

describe('callPut', () => {
  it('should call fetch put without authorization header', async () => {
    const mockFetch = mockOkFetch();
    vi.stubGlobal('fetch', mockFetch);

    await callPut({ data: 'data', session: null, url: '/test/' });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/test/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: 'data',
    });
  });

  it('should call fetch put with authorization header', async () => {
    const mockFetch = mockOkFetch();
    vi.stubGlobal('fetch', mockFetch);

    await callPut({
      data: 'data',
      session: fakeAuthenticatedSession(),
      url: '/test/',
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/test/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${apiToken}`,
      },
      body: 'data',
    });
  });
});

describe('error handling', () => {
  it('should throw a FetchError with status and parsed body on non-OK response', async () => {
    const errorBody = { detail: 'Not found' };
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: () => Promise.resolve(errorBody),
    });
    vi.stubGlobal('fetch', mockFetch);

    await expect(callGet({ session: null, url: '/test/' })).rejects.toThrow(
      FetchError
    );

    await expect(
      callGet({ session: null, url: '/test/' })
    ).rejects.toMatchObject({
      status: 404,
      data: errorBody,
      message: 'Not Found',
    });
  });

  it('should propagate JSON parse errors on successful (2xx) responses', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve('<html><body>Error</body></html>'),
    });
    vi.stubGlobal('fetch', mockFetch);

    await expect(callGet({ session: null, url: '/test/' })).rejects.toThrow(
      SyntaxError
    );
  });

  it('should throw a FetchError with null data when error body cannot be parsed', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: () => Promise.reject(new Error('invalid json')),
    });
    vi.stubGlobal('fetch', mockFetch);

    await expect(
      callGet({ session: null, url: '/test/' })
    ).rejects.toMatchObject({
      status: 500,
      data: null,
      message: 'Internal Server Error',
    });
  });
});

describe('responseType: blob', () => {
  it('should return a Blob when responseType is blob', async () => {
    const blob = new Blob(['binary'], { type: 'application/octet-stream' });
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(blob),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await callGet({
      config: { responseType: 'blob' },
      session: null,
      url: '/test/',
    });

    expect(result.data).toBe(blob);
  });
});
