import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { AppController } from './../src/app.controller';
import { AppService } from './../src/app.service';
import { adminCredentials } from './mockdata';
import { GradingDto } from '../src/preference/dto/grading.dto';
import * as cookieParser from 'cookie-parser';
import * as cookie from 'cookie-parse';

describe('Grading Preference (e2e)', () => {
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

  const Grading: GradingDto = {
    name: 'Test grading',
  };
  const childGradingType: GradingDto = {
    name: 'Child grading',
  };
  let gradingParentId: number;
  const updateData: GradingDto = {
    name: 'update-grading',
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

  it('Should add Grading preference (POST) /api/grading-preference', async () => {
    const res = await request(app.getHttpServer())
      .post('/grading-preference')
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(Grading);
    gradingParentId = res.body.payload.id;
    expect(res.status).toEqual(201);
    expect(res.body.message).toEqual('Grading preference added successfully');
  });

  it('Should add child Grading preference (POST) /api/grading-preference', async () => {
    const res = await request(app.getHttpServer())
      .post(`/grading-preference/${gradingParentId}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(childGradingType);
    expect(res.status).toEqual(201);
    expect(res.body.message).toEqual('Grading preference added successfully');
  });

  it('Should not add Grading preference #Unauthorized (POST) /api/grading-preference', async () => {
    const res = await request(app.getHttpServer())
      .post('/grading-preference')
      .set('Content-Type', 'application/json')
      .send(Grading);
    expect(res.status).toEqual(401);
    expect(res.body.message).toEqual(['Unauthorized']);
  });

  it('Should update Grading preference (PATCH) /api/grading-preference/id', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/grading-preference/${gradingParentId}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(updateData);
    expect(res.status).toEqual(200);
    expect(res.body.message).toEqual('Grading preference updated successfully');
  });

  it('Should not update Grading preference (PATCH) /api/grading-preference/id', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/grading-preference/${100}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(updateData);
    expect(res.status).toEqual(404);
    expect(res.body.error).toEqual('Not Found');
  });

  it('Should not update Grading preference #Unauthorized (PATCH) /api/grading-preference/id', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/grading-preference/${gradingParentId}`)
      .set('Content-Type', 'application/json')
      .send(updateData);
    expect(res.status).toEqual(401);
    expect(res.body.message).toEqual(['Unauthorized']);
  });

  it('Should get specific Grading preference (GET) /api/grading-preference/id', async () => {
    const res = await request(app.getHttpServer()).get(
      `/grading-preference/${gradingParentId}`,
    );
    expect(res.status).toEqual(200);
    expect(res.body.message).toEqual('Grading preference retrieval success');
  });

  it('Should get all Grading preference (GET) /api/grading-preference', async () => {
    const res = await request(app.getHttpServer()).get(`/grading-preference`);
    expect(res.status).toEqual(200);
    expect(res.body.message).toEqual('Grading preferences retrieval success');
  });

  it('Should delete Grading (DELETE) /api/grading-preference/id', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/grading-preference/${gradingParentId}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      );
    expect(res.status).toEqual(200);
    expect(res.body.message).toEqual('Grading preference deletion success');
  });

  it('Should not delete Grading preference #Unauthorized (DELETE) /api/grading-preference/id', async () => {
    const res = await request(app.getHttpServer()).delete(
      `/grading-preference/${gradingParentId}`,
    );
    expect(res.status).toEqual(401);
    expect(res.body.message).toEqual(['Unauthorized']);
  });

  it('Should not delete Grading preference #Not found (DELETE) /api/grading-preference/id', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/grading-preference/${100}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      );
    expect(res.status).toEqual(404);
    expect(res.body.error).toEqual('Not Found');
  });

  afterAll(async (done) => {
    await app.close();
    done();
  });
});
