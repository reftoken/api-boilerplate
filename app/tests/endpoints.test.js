process.env.NODE_ENV = 'test';

const request = require('supertest');

const { app, server } = require('../index');
const db = require('../lib/db');

describe('Test routes endpoints', () => {
  beforeAll(async () => {
    try {
      await db.connect();
    } catch (error) {
      console.log(error);
    }
  });

  afterEach(async () => {
    try {
      await db.disconnect();
    } catch (error) {
      console.log(error);
    }
  });

  afterAll(async () => {
    try {
      await db.disconnect();
      await server.close();
    } catch (error) {
      console.log(error);
    }
  });

  it('GET /ping should respond with Pong!', async done => {
    expect.assertions(3);
    const res = await request(app.callback()).get('/ping');
    expect(res).toBeDefined();
    expect(res.status).toEqual(200);
    expect(JSON.parse(res.text)).toEqual({ message: 'Pong!' });
    done();
  });
});
