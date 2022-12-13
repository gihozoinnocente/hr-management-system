import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { AppController } from './../src/app.controller';
import { AppService } from './../src/app.service';
import { OpportunityTypeDto } from '../src/preference/dto/opportunity-type.dto';
import { adminCredentials } from './mockdata';
import { EmploymentStatusDto } from '../src/preference/dto/employment-status.dto';
import * as cookieParser from 'cookie-parser';
import * as cookie from 'cookie-parse';

describe('Employment status Type Preference (e2e)', () => {
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

  const employmentStatus: EmploymentStatusDto = {
    name: 'Employed',
  };
  let employmentStatusId: number;
  const updateData: OpportunityTypeDto = {
    name: 'Unemployed',
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

  it('Should add language preference (POST) /api/employment-status-preference', async () => {
    const res = await request(app.getHttpServer())
      .post('/employment-status-preference')
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(employmentStatus);
    employmentStatusId = res.body.payload.id;
    expect(res.status).toEqual(201);
    expect(res.body.message).toEqual('Employment status added successfully');
  });

  it('Should not add language preference #Unauthorized (POST) /api/employment-status-preference', async () => {
    const res = await request(app.getHttpServer())
      .post('/employment-status-preference')
      .set('Content-Type', 'application/json')
      .send(employmentStatus);
    expect(res.status).toEqual(401);
    expect(res.body.message).toEqual(['Unauthorized']);
  });

  it('Should update language preference (PATCH) /api/employment-status-preference/id', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/employment-status-preference/${employmentStatusId}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(updateData);
    expect(res.status).toEqual(200);
    expect(res.body.message).toEqual('Employment status updated successfully');
  });

  it('Should not update language preference (PATCH) /api/employment-status-preference/id', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/employment-status-preference/${100}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(updateData);
    expect(res.status).toEqual(404);
    expect(res.body.error).toEqual('Not Found');
  });

  it('Should not update language preference #Unauthorized (PATCH) /api/employment-status-preference/id', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/employment-status-preference/${employmentStatusId}`)
      .set('Content-Type', 'application/json')
      .send(updateData);
    expect(res.status).toEqual(401);
    expect(res.body.message).toEqual(['Unauthorized']);
  });

  it('Should get specific language preference (GET) /api/employment-status-preference/id', async () => {
    const res = await request(app.getHttpServer()).get(
      `/employment-status-preference/${employmentStatusId}`,
    );
    expect(res.status).toEqual(200);
    expect(res.body.message).toEqual('Employment status retrieval success');
  });

  it('Should get all languages preference (GET) /api/employment-status-preference', async () => {
    const res = await request(app.getHttpServer()).get(
      `/employment-status-preference`,
    );
    expect(res.status).toEqual(200);
    expect(res.body.message).toEqual('Employment statuses retrieval success');
  });

  it('Should delete languages (DELETE) /api/employment-status-preference/id', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/employment-status-preference/${employmentStatusId}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      );
    expect(res.status).toEqual(200);
    expect(res.body.message).toEqual('Employment status deletion success');
  });

  it('Should not delete languages preference #Unauthorized (DELETE) /api/employment-status-preference/id', async () => {
    const res = await request(app.getHttpServer()).delete(
      `/employment-status-preference/${employmentStatusId}`,
    );
    expect(res.status).toEqual(401);
    expect(res.body.message).toEqual(['Unauthorized']);
  });

  it('Should not delete languages preference #Not found (DELETE) /api/employment-status-preference/id', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/employment-status-preference/${100}`)
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
