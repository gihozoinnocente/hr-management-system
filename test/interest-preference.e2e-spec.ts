import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { AppController } from './../src/app.controller';
import { AppService } from './../src/app.service';
import { adminCredentials } from './mockdata';
import * as cookieParser from 'cookie-parser';
import * as cookie from 'cookie-parse';
import { InterestDto } from '../src/preference/dto/interest.dto';

describe('interest Preference (e2e)', () => {
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

  const interest: InterestDto = {
    name: 'some interest',
  };
  let interestId: number;
  const updateData: InterestDto = {
    name: 'some update interest',
  };

  let authCookies: Record<string, string>;

  it('Should login the admin {/api/auth/admin-login, POST}', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/admin-login')
      .set('Content-Type', 'application/json')
      .send(adminCredentials);
    authCookies = cookie.parse(res.headers['set-cookie'].join(';'));
    expect(res.status).toEqual(201);
  });

  it('Should add interest preference (POST) /api/interest-preference', async () => {
    const res = await request(app.getHttpServer())
      .post('/interest-preference')
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(interest);
    interestId = res.body.payload.id;
    expect(res.status).toEqual(201);
  });

  it('Should not add interest preference #Unauthorized (POST) /api/interest-preference', async () => {
    const res = await request(app.getHttpServer())
      .post('/interest-preference')
      .set('Content-Type', 'application/json')
      .send(interest);
    expect(res.status).toEqual(401);
  });

  it('Should update interest preference (PATCH) /api/interest-preference/id', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/interest-preference/${interestId}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(updateData);
    expect(res.status).toEqual(200);
  });

  it('Should not update interest preference (PATCH) /api/interest-preference/id', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/interest-preference/${100}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(updateData);
    expect(res.status).toEqual(404);
  });

  it('Should not update interest preference #Unauthorized (PATCH) /api/interest-preference/id', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/interest-preference/${interestId}`)
      .set('Content-Type', 'application/json')
      .send(updateData);
    expect(res.status).toEqual(401);
  });

  it('Should get specific interest preference (GET) /api/interest-preference/id', async () => {
    const res = await request(app.getHttpServer()).get(
      `/interest-preference/${interestId}`,
    );
    expect(res.status).toEqual(200);
  });

  it('Should get all interest preference (GET) /api/interest-preference', async () => {
    const res = await request(app.getHttpServer()).get(`/interest-preference`);
    expect(res.status).toEqual(200);
  });

  it('Should delete interest (DELETE) /api/interest-preference/id', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/interest-preference/${interestId}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      );
    expect(res.status).toEqual(200);
  });

  it('Should not delete interest preference #Unauthorized (DELETE) /api/interest-preference/id', async () => {
    const res = await request(app.getHttpServer()).delete(
      `/interest-preference/${interestId}`,
    );
    expect(res.status).toEqual(401);
  });

  it('Should not delete interest preference #Not found (DELETE) /api/interest-preference/id', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/interest-preference/${100}`)
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
