import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { AppController } from './../src/app.controller';
import { AppService } from './../src/app.service';
import { adminCredentials } from './mockdata';
import * as cookieParser from 'cookie-parser';
import * as cookie from 'cookie-parse';

describe('Communication (e2e)', () => {
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

  const communication = {
    type: 'email',
    subject: 'TESTING',
    target: {
      socialClass: ['a'],
    },
    message: 'This is the testing message',
  };

  let communicationId: number;

  let authCookies: Record<string, string>;

  it('Should login the admin {/api/auth/admin-login, POST}', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/admin-login')
      .set('Content-Type', 'application/json')
      .send(adminCredentials);
    authCookies = cookie.parse(res.headers['set-cookie'].join(';'));
    expect(res.status).toEqual(201);
  });

  it('Should create communication ( POST ) /api/communication', async () => {
    const res = await request(app.getHttpServer())
      .post(`/communication`)
      .set('Content-Type', 'application/json')
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .send(communication);
    expect(res.status).toEqual(201);
    communicationId = res.body.payload.id;
    console.log(communicationId);
  });

  it('Should get all communication ( GET ) /api/communication', async () => {
    const res = await request(app.getHttpServer())
      .get(`/communication`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      );
    expect(res.status).toEqual(200);
  });

  it('Should resend specific communication ( GET ) /api/communication/id', async () => {
    console.log(communicationId);
    const res = await request(app.getHttpServer())
      .patch(`/communication/${communicationId}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      );
    expect(res.status).toEqual(200);
  });

  it('Should not resend specific communication ( GET ) /api/communication/id', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/communication/${1000}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      );
    expect(res.status).toEqual(404);
  });

  it('Should delete communication ( DELETE ) /api/communication/:id', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/communication/${communicationId}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      );
    expect(res.status).toEqual(200);
  });

  afterAll(async (done) => {
    await app.close();
    done();
  });
});
