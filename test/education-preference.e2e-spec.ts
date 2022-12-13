import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { AppController } from './../src/app.controller';
import { AppService } from './../src/app.service';
import { AddEducationLevelDto } from '../src/preference/dto/education.dto';
import { adminCredentials } from './mockdata';
import * as cookieParser from 'cookie-parser';
import * as cookie from 'cookie-parse';

describe('Education Preference (e2e)', () => {
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

  const educationLevel: AddEducationLevelDto = {
    name: 'Undergraduate',
  };
  let educationId: number;
  const updateData: AddEducationLevelDto = {
    name: 'Masters',
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

  it('Should add education level preference (POST) /api/education-level-preference', async () => {
    const res = await request(app.getHttpServer())
      .post('/education-level-preference')
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(educationLevel);
    educationId = res.body.payload.id;
    expect(res.status).toEqual(201);
    expect(res.body.message).toEqual('Education level added successfully');
  });

  it('Should not add education level preference #Unauthorized (POST) /api/education-level-preference', async () => {
    const res = await request(app.getHttpServer())
      .post('/education-level-preference')
      .set('Content-Type', 'application/json')
      .send(educationLevel);
    expect(res.status).toEqual(401);
    expect(res.body.message).toEqual(['Unauthorized']);
  });

  it('Should update education level preference (POST) /api/education-level-preference/id', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/education-level-preference/${educationId}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(updateData);
    expect(res.status).toEqual(200);
    expect(res.body.message).toEqual('Education level updated successfully');
  });

  it('Should not update education level preference (POST) /api/education-level-preference/id', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/education-level-preference/${100}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(updateData);
    expect(res.status).toEqual(404);
    expect(res.body.error).toEqual('Not Found');
  });

  it('Should not update education level preference #Unauthorized (POST) /api/education-level-preference/id', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/education-level-preference/${educationId}`)
      .set('Content-Type', 'application/json')
      .send(updateData);
    expect(res.status).toEqual(401);
    expect(res.body.message).toEqual(['Unauthorized']);
  });

  it('Should get specific education level preference (GET) /api/education-level-preference/id', async () => {
    const res = await request(app.getHttpServer()).get(
      `/education-level-preference/${educationId}`,
    );
    expect(res.status).toEqual(200);
    expect(res.body.message).toEqual('Education level retrieval success');
  });

  it('Should get all education level preference (GET) /api/education-level-preference', async () => {
    const res = await request(app.getHttpServer()).get(
      `/education-level-preference`,
    );
    expect(res.status).toEqual(200);
    expect(res.body.message).toEqual('Education levels retrieval success');
  });

  it('Should delete education level preference (DELETE) /api/education-level-preference/id', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/education-level-preference/${educationId}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      );
    expect(res.status).toEqual(200);
    expect(res.body.message).toEqual('Education level deletion success');
  });

  it('Should not delete education level preference #Unauthorized (DELETE) /api/education-level-preference/id', async () => {
    const res = await request(app.getHttpServer()).delete(
      `/education-level-preference/${educationId}`,
    );
    expect(res.status).toEqual(401);
    expect(res.body.message).toEqual(['Unauthorized']);
  });

  it('Should not delete education level preference #Not found (DELETE) /api/education-level-preference/id', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/education-level-preference/${100}`)
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
