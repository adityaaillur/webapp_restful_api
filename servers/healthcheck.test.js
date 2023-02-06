const express = require('express');
const request = require('supertest');
const healthCheck = require('./healthcheck.js');

describe('Health Check', () => {
  let app;

  beforeEach(() => {
    app = express();
    healthCheck(app);
  });

  it('should return 200 OK', async () => {
    const res = await request(app).get('/healthz');
    expect(res.statusCode).toBe(200);
  });
});
