const express = require('express');
const request = require('supertest');
const health = require('./health.js');

describe('Health Check', () => {
  let app;

  beforeEach(() => {
    app = express();
    health(app);
  });

  it('should return 200 OK', async () => {
    const res = await request(app).get('/aditya');
    expect(res.statusCode).toBe(200);
  });
});
