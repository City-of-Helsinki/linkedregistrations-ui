import { setupServer } from 'msw/node';

const server = setupServer();

export { http, HttpResponse } from 'msw';
export { server };
