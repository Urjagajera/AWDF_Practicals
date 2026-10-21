import request from 'supertest';
import { createApp, closeDb } from '../src/app';
import { db } from '../src/db';

const app = createApp();
const user = { email: 'ci.user@example.com', password: 'ci-password-123' };
let token: string;

beforeAll(async () => {
  await db.asPromise();
  await db.dropDatabase(); // start every run from an empty test database
  await request(app).post('/auth/register').send(user);
  const res = await request(app).post('/auth/login').send(user);
  token = res.body.token;
});

afterAll(async () => {
  await db.dropDatabase();
  await closeDb();
});

test('GET /tasks returns 200', async () => {
  const res = await request(app).get('/tasks').set('Authorization', `Bearer ${token}`);
  expect(res.statusCode).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
});
