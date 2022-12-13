import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { AppController } from './../src/app.controller';
import { AppService } from './../src/app.service';
import { candidateCredentials, interestCreateData } from './mockdata';
import { getConnection } from 'typeorm';
import * as cookieParser from 'cookie-parser';
import * as cookie from 'cookie-parse';

describe('Interest (e2e)', () => {
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
  let interestId: number;

  let authCookies: Record<string, string>;

  it('Should login the admin {/api/auth/admin-login, POST}', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/candidate-login')
      .set('Content-Type', 'application/json')
      .send(candidateCredentials);
    authCookies = cookie.parse(res.headers['set-cookie'].join(';'));
    expect(res.status).toEqual(201);
  });

  it('Should add a interest (POST) /api/profile/interest/', async () => {
    const res = await request(app.getHttpServer())
      .post('/profile/interest/')
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(interestCreateData);
    interestId = 1;
    expect(res.status).toEqual(201);
  });

  it('Should get all interests (GET)  /api/profile/interest/', async () => {
    const res = await request(app.getHttpServer())
      .get(`/profile/interest/`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      );
    expect(res.status).toEqual(200);
  });

  it('Should delete interest (DELETE)  /api/profile/interest/:id', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/profile/interest/${interestId}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      );
    expect(res.status).toEqual(200);
  });

  it('Should throw not found any interest', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/profile/interest/${0}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      );
    expect(res.status).toEqual(404);
  });

  afterAll(async (done) => {
    const entities = getConnection().entityMetadatas;
    for (const entity of entities) {
      if (entity.name === 'Interest') {
        const repository = getConnection().getRepository(entity.name);
        await repository.clear();
      }
    }
    await app.close();
    done();
  });
});
