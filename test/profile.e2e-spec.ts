import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { AppController } from './../src/app.controller';
import { AppService } from './../src/app.service';
import {
  candidateCredentials,
  profileCreateData,
  profileUpdateData,
} from './mockdata';
import * as cookieParser from 'cookie-parser';
import * as cookie from 'cookie-parse';

describe('Profile (e2e)', () => {
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
  let authCookies: Record<string, string>;

  it('Should login the admin {/api/auth/admin-login, POST}', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/candidate-login')
      .set('Content-Type', 'application/json')
      .send(candidateCredentials);
    authCookies = cookie.parse(res.headers['set-cookie'].join(';'));
    expect(res.status).toEqual(201);
  });

  it('Should add general information for candidate (POST) /api/profile/general-info/', async () => {
    const res = await request(app.getHttpServer())
      .put('/profile/general-info/')
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(profileCreateData);
    expect(res.status).toEqual(200);
    expect(res.body.message).toEqual(
      'General Information updated successfully',
    );
  });

  it('Should update general information for candidate (POST) /api/profile/general-info/', async () => {
    const res = await request(app.getHttpServer())
      .put('/profile/general-info/')
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(profileUpdateData);
    expect(res.status).toEqual(200);
    expect(res.body.message).toEqual(
      'General Information updated successfully',
    );
  });

  it('Should get candidate profile with general information (GET)  /api/profile/general-info/', async () => {
    const res = await request(app.getHttpServer())
      .get(`/profile/general-info/`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      );
    expect(res.status).toEqual(200);
    expect(res.body.message).toEqual('General Info retrieved successfully');
  });

  afterAll(async (done) => {
    await app.close();
    done();
  });
});
