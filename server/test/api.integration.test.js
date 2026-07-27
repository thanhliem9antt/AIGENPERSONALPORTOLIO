import assert from 'node:assert/strict';
import { after, before, beforeEach, test } from 'node:test';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-that-is-at-least-thirty-two-characters';
process.env.IP_HASH_SECRET = 'test-ip-secret-that-is-at-least-thirty-two-characters';
process.env.CLIENT_URL = 'http://localhost:5173';

const { default: app } = await import('../src/app.js');

let mongo;
const origin = 'http://localhost:5173';
const credentials = (suffix = '') => ({
  fullName: `Người dùng ${suffix || 'A'}`,
  username: `user_${suffix || 'a'}`,
  email: `user_${suffix || 'a'}@example.com`,
  password: 'Password@123',
});

function authCookie(response) {
  const cookie = response.headers['set-cookie']?.[0];
  assert.ok(cookie, 'response should set an authentication cookie');
  return cookie.split(';')[0];
}

before(async () => {
  mongo = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongo.getUri();
  await mongoose.connect(process.env.MONGODB_URI);
});

beforeEach(async () => {
  await mongoose.connection.db.dropDatabase();
});

after(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

test('register creates a complete account and authenticated session', async () => {
  const response = await request(app).post('/api/auth/register').send(credentials()).expect(201);
  const cookie = authCookie(response);

  assert.equal(response.body.user.username, 'user_a');
  await request(app).get('/api/auth/me').set('Cookie', cookie).expect(200);

  const profile = await request(app).get('/api/profile/me').set('Cookie', cookie).expect(200);
  assert.equal(profile.body.profile.displayName, 'Người dùng A');
});

test('cookie mutations require an allowed Origin', async () => {
  const registered = await request(app).post('/api/auth/register').send(credentials('csrf')).expect(201);
  const cookie = authCookie(registered);

  await request(app)
    .put('/api/profile/me')
    .set('Cookie', cookie)
    .send({ headline: 'Blocked' })
    .expect(403);

  const allowed = await request(app)
    .put('/api/profile/me')
    .set('Cookie', cookie)
    .set('Origin', origin)
    .send({ headline: 'Allowed' })
    .expect(200);
  assert.equal(allowed.body.profile.headline, 'Allowed');
});

test('resources cannot be edited by another account', async () => {
  const owner = await request(app).post('/api/auth/register').send(credentials('owner')).expect(201);
  const attacker = await request(app).post('/api/auth/register').send(credentials('attacker')).expect(201);

  const created = await request(app)
    .post('/api/projects')
    .set('Cookie', authCookie(owner))
    .set('Origin', origin)
    .send({ title: 'Private project' })
    .expect(201);

  await request(app)
    .put(`/api/projects/${created.body.item._id}`)
    .set('Cookie', authCookie(attacker))
    .set('Origin', origin)
    .send({ title: 'Stolen project' })
    .expect(404);
});

test('changing password invalidates the previous token and issues a new one', async () => {
  const registered = await request(app).post('/api/auth/register').send(credentials('password')).expect(201);
  const previousCookie = authCookie(registered);

  const changed = await request(app)
    .put('/api/auth/change-password')
    .set('Cookie', previousCookie)
    .set('Origin', origin)
    .send({ currentPassword: 'Password@123', newPassword: 'NewPassword@123' })
    .expect(200);
  const currentCookie = authCookie(changed);

  await request(app).get('/api/auth/me').set('Cookie', previousCookie).expect(401);
  await request(app).get('/api/auth/me').set('Cookie', currentCookie).expect(200);
});
