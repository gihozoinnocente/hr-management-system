import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { AppController } from './../src/app.controller';
import { AppService } from './../src/app.service';
import {
  candidateCredentials,
  employmentJourneyCreateData,
  employmentJourneyUpdateData,
} from './mockdata';
import * as cookieParser from 'cookie-parser';
import * as cookie from 'cookie-parse';

describe('Employment journey (e2e)', () => {
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
  let employmentJourneyId: number;

  let authCookies: Record<string, string>;

  it('Should login the admin {/api/auth/admin-login, POST}', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/candidate-login')
      .set('Content-Type', 'application/json')
      .send(candidateCredentials);
    authCookies = cookie.parse(res.headers['set-cookie'].join(';'));
    expect(res.status).toEqual(201);
  });

  it('Should add a employmentJourney (POST) /api/profile/employmentJourney/', async () => {
    const res = await request(app.getHttpServer())
      .post('/profile/employmentJourney/')
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(employmentJourneyCreateData);
    employmentJourneyId = res.body.payload.id;
    expect(res.status).toEqual(201);
  });

  it('Should get all employmentJourneys (GET)  /api/profile/employmentJourney/', async () => {
    const res = await request(app.getHttpServer())
      .get(`/profile/employmentJourney/`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      );
    expect(res.status).toEqual(200);
  });

  it('Should update employmentJourney (PATCH)  /api/profile/employmentJourney/:id', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/profile/employmentJourney/${employmentJourneyId}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(employmentJourneyUpdateData);
    expect(res.status).toEqual(200);
  });

  it('Should delete employmentJourney (DELETE)  /api/profile/employmentJourney/:id', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/profile/employmentJourney/${employmentJourneyId}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      );
    expect(res.status).toEqual(200);
  });

  it('Should throw not found any employmentJourney', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/profile/employmentJourney/${0}`)
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
