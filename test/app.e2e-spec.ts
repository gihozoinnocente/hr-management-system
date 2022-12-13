import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { AppController } from './../src/app.controller';
import { AppService } from './../src/app.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [AppService],
      controllers: [AppController],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('Should get welcome meassage (GET) /api', async () => {
    const res = await request(app.getHttpServer()).get('/');
    expect(res.status).toEqual(200);
    expect(res.body.message).toEqual('Welcome to harambee API');
  });

  it('Should not get welcome meassage (GET) /api/welcome', async () => {
    const res = await request(app.getHttpServer()).get('/welcome');
    expect(res.status).toEqual(404);
    expect(res.body.message).toEqual(['Cannot GET /welcome']);
  });

  afterAll(async (done) => {
    await app.close();
    done();
  });
});
