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

// Post-lab: tests covering different endpoints.

test('GET /tasks without a token returns 401', async () => {
  const res = await request(app).get('/tasks');
  expect(res.statusCode).toBe(401);
  expect(res.body.error).toMatch(/Missing token/);
});

test('POST /tasks creates a task that GET /tasks then returns', async () => {
  const created = await request(app)
    .post('/tasks')
    .set('Authorization', `Bearer ${token}`)
    .send({ title: '  Written by CI  ', priority: 'high' });
  expect(created.statusCode).toBe(201);
  expect(created.body.title).toBe('Written by CI');

  const list = await request(app).get('/tasks').set('Authorization', `Bearer ${token}`);
  expect(list.body.map((t: { title: string }) => t.title)).toContain('Written by CI');
});

test('POST /tasks without a title is rejected with 400', async () => {
  const res = await request(app).post('/tasks').set('Authorization', `Bearer ${token}`).send({ priority: 'low' });
  expect(res.statusCode).toBe(400);
  expect(res.body.fields.title).toBe('title is required');
});

test('POST /auth/login with a wrong password returns 401', async () => {
  const res = await request(app).post('/auth/login').send({ ...user, password: 'not-the-password' });
  expect(res.statusCode).toBe(401);
});
