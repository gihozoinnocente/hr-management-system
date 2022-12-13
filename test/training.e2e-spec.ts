import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { AppController } from './../src/app.controller';
import { AppService } from './../src/app.service';
import {
  candidateCredentials,
  trainingCreateData,
  trainingUpdateData,
} from './mockdata';
import * as cookieParser from 'cookie-parser';
import * as cookie from 'cookie-parse';

describe('Training (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [AppService],
      controllers: [AppController],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    await app.init();
  });
  let trainingId: number;

  let authCookies: Record<string, string>;

  it('Should login the admin {/api/auth/admin-login, POST}', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/candidate-login')
      .set('Content-Type', 'application/json')
      .send(candidateCredentials);
    authCookies = cookie.parse(res.headers['set-cookie'].join(';'));
    expect(res.status).toEqual(201);
  });

  it('Should add a training (POST) /api/profile/training/', async () => {
    const res = await request(app.getHttpServer())
      .post('/profile/training/')
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(trainingCreateData);
    trainingId = res.body.payload.id;
    expect(res.status).toEqual(201);
  });

  it('Should get all trainings (GET)  /api/profile/training/', async () => {
    const res = await request(app.getHttpServer())
      .get(`/profile/training/`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      );
    expect(res.status).toEqual(200);
  });

  it('Should update training (PATCH)  /api/profile/training/:id', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/profile/training/${trainingId}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(trainingUpdateData);
    expect(res.status).toEqual(200);
  });

  it('Should delete training (DELETE)  /api/profile/training/:id', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/profile/training/${trainingId}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      );
    expect(res.status).toEqual(200);
  });

  it('Should throw not found any training', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/profile/training/${0}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      );
    expect(res.status).toEqual(404);
  });

  afterAll(async (done) => {
    await app.close();
    done();
  });
});
