import supertest from 'supertest';

export const testGet = (api: supertest.SuperTest<supertest.Test>, endpoint: string) => api.get(`/api/v8${endpoint}`);
export const testPost = (api: supertest.SuperTest<supertest.Test>, endpoint: string) => api.post(`/api/v8${endpoint}`);
