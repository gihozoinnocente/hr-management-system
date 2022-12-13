import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { AppController } from './../src/app.controller';
import { AppService } from './../src/app.service';
import { candidateCredentials, languageCreateData } from './mockdata';
import * as cookieParser from 'cookie-parser';
import * as cookie from 'cookie-parse';

describe('Language (e2e)', () => {
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
  let languageId: number;

  let authCookies: Record<string, string>;

  it('Should login the admin {/api/auth/admin-login, POST}', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/candidate-login')
      .set('Content-Type', 'application/json')
      .send(candidateCredentials);
    authCookies = cookie.parse(res.headers['set-cookie'].join(';'));
    expect(res.status).toEqual(201);
  });

  it('Should add a language (POST) /api/profile/language/', async () => {
    const res = await request(app.getHttpServer())
      .post('/profile/language/')
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(languageCreateData);
    expect(res.status).toEqual(201);
  });

  it('Should get all languages (GET)  /api/profile/language/', async () => {
    const res = await request(app.getHttpServer())
      .get(`/profile/language/`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      );
    languageId = res.body.payload.id;
    expect(res.status).toEqual(200);
  });

  xit('Should delete language (DELETE)  /api/profile/language/:id', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/profile/language/${languageId}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      );
    expect(res.status).toEqual(200);
  });

  it('Should throw not found any language', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/profile/language/${0}`)
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
