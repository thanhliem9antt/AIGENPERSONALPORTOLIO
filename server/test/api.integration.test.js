import assert from 'node:assert/strict';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, before, beforeEach, test } from 'node:test';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-that-is-at-least-thirty-two-characters';
process.env.IP_HASH_SECRET = 'test-ip-secret-that-is-at-least-thirty-two-characters';
process.env.CLIENT_URL = 'http://localhost:5173';
process.env.MONGOMS_DOWNLOAD_DIR ||= path.join(tmpdir(), 'noir-mongodb-binaries');

const { default: app } = await import('../src/app.js');
const { default: User } = await import('../src/models/User.js');
const { default: Friendship } = await import('../src/models/Friendship.js');

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
  await mongo?.stop();
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

  await request(app).put('/api/profile/me').set('Cookie', cookie).send({ headline: 'Blocked' }).expect(403);

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

test('registration records a valid referrer and increments their referral count', async () => {
  await request(app).post('/api/auth/register').send(credentials('inviter')).expect(201);
  await request(app)
    .post('/api/auth/register')
    .send({ ...credentials('referred'), ref: 'user_inviter' })
    .expect(201);

  const inviter = await User.findOne({ username: 'user_inviter' });
  const referred = await User.findOne({ username: 'user_referred' }).select('+referredBy');
  assert.equal(inviter.referralCount, 1);
  assert.equal(referred.referredBy.toString(), inviter.id);
});

test('watch rooms support joining, friend invitations and personal history', async () => {
  const hostResponse = await request(app).post('/api/auth/register').send(credentials('watch_host')).expect(201);
  const guestResponse = await request(app).post('/api/auth/register').send(credentials('watch_guest')).expect(201);
  const hostCookie = authCookie(hostResponse);
  const guestCookie = authCookie(guestResponse);

  const created = await request(app)
    .post('/api/watch/rooms')
    .set('Cookie', hostCookie)
    .set('Origin', origin)
    .send({})
    .expect(201);
  assert.match(created.body.room.roomId, /^[A-HJ-NP-Z2-9]{8}$/);

  const joined = await request(app)
    .post(`/api/watch/rooms/${created.body.room.roomId}/join`)
    .set('Cookie', guestCookie)
    .set('Origin', origin)
    .expect(200);
  assert.equal(joined.body.room.hostId.username, 'user_watch_host');

  await request(app)
    .post(`/api/watch/rooms/${created.body.room.roomId}/invites`)
    .set('Cookie', hostCookie)
    .set('Origin', origin)
    .send({ username: 'user_watch_guest' })
    .expect(403);

  await Friendship.create({
    requester: hostResponse.body.user._id,
    recipient: guestResponse.body.user._id,
    status: 'accepted',
  });
  await request(app)
    .post(`/api/watch/rooms/${created.body.room.roomId}/invites`)
    .set('Cookie', hostCookie)
    .set('Origin', origin)
    .send({ username: 'user_watch_guest' })
    .expect(201);

  const invites = await request(app).get('/api/watch/invites').set('Cookie', guestCookie).expect(200);
  assert.equal(invites.body.invites.length, 1);
  assert.equal(invites.body.invites[0].roomId, created.body.room.roomId);

  await request(app)
    .post('/api/watch/history')
    .set('Cookie', hostCookie)
    .set('Origin', origin)
    .send({
      videoId: 'dQw4w9WgXcQ',
      title: 'Test video',
      thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
      channelTitle: 'Test channel',
    })
    .expect(201);
  const suggestions = await request(app).get('/api/watch/search').set('Cookie', hostCookie).expect(200);
  assert.equal(suggestions.body.source, 'history');
  assert.equal(suggestions.body.videos[0].videoId, 'dQw4w9WgXcQ');
  assert.equal(suggestions.body.videos[0].watchCount, 1);
});
