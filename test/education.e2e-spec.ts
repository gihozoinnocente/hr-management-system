import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { AppController } from './../src/app.controller';
import { AppService } from './../src/app.service';
import {
  candidateCredentials,
  educationCreateData,
  educationUpdateData,
} from './mockdata';
import * as cookieParser from 'cookie-parser';
import * as cookie from 'cookie-parse';

describe('Education (e2e)', () => {
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
  let educationId: number;

  let authCookies: Record<string, string>;

  it('Should login the admin {/api/auth/admin-login, POST}', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/candidate-login')
      .set('Content-Type', 'application/json')
      .send(candidateCredentials);
    authCookies = cookie.parse(res.headers['set-cookie'].join(';'));
    expect(res.status).toEqual(201);
  });

  it('Should add education level (POST) /api/profile/education/', async () => {
    const res = await request(app.getHttpServer())
      .post('/profile/education/')
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(educationCreateData);
    educationId = res.body.payload.id;
    expect(res.status).toEqual(201);
  });

  it('Should get all education levels (GET)  /api/profile/education/', async () => {
    const res = await request(app.getHttpServer())
      .get(`/profile/education/`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      );
    expect(res.status).toEqual(200);
  });

  it('Should update education level (PATCH)  /api/profile/education/:id', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/profile/education/${educationId}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(educationUpdateData);
    expect(res.status).toEqual(200);
  });

  it('Should delete education level (DELETE)  /api/profile/education/:id', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/profile/education/${educationId}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      );
    expect(res.status).toEqual(200);
  });

  it('Should throw not found any education level', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/profile/education/${0}`)
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
