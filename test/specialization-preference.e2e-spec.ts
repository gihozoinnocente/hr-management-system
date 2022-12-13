import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { AppController } from './../src/app.controller';
import { AppService } from './../src/app.service';
import { adminCredentials } from './mockdata';
import { SpecializationDto } from '../src/preference/dto/specialization.dto';
import * as cookieParser from 'cookie-parser';
import * as cookie from 'cookie-parse';

describe('Specialization Preference (e2e)', () => {
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

  const specialization: SpecializationDto = {
    name: 'Health',
  };
  const childSpecialization: SpecializationDto = {
    name: 'Pharmacy',
  };
  let specializationParentId: number;
  const updateData: SpecializationDto = {
    name: 'Health-Industry',
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

  it('Should add specialization preference (POST) /api/specialization-preference', async () => {
    const res = await request(app.getHttpServer())
      .post('/specialization-preference')
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(specialization);
    specializationParentId = res.body.payload.id;
    expect(res.status).toEqual(201);
    expect(res.body.message).toEqual('Specialization added successfully');
  });

  it('Should add child specialization preference (POST) /api/specialization-preference', async () => {
    const res = await request(app.getHttpServer())
      .post(`/specialization-preference/${specializationParentId}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(childSpecialization);
    expect(res.status).toEqual(201);
    expect(res.body.message).toEqual('Specialization added successfully');
  });

  it('Should not add specialization preference #Unauthorized (POST) /api/specialization-preference', async () => {
    const res = await request(app.getHttpServer())
      .post('/specialization-preference')
      .set('Content-Type', 'application/json')
      .send(specialization);
    expect(res.status).toEqual(401);
    expect(res.body.message).toEqual(['Unauthorized']);
  });

  it('Should update specialization preference (PATCH) /api/specialization-preference/id', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/specialization-preference/${specializationParentId}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(updateData);
    expect(res.status).toEqual(200);
    expect(res.body.message).toEqual('Specialization updated successfully');
  });

  it('Should not update specialization preference (PATCH) /api/specialization-preference/id', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/specialization-preference/${100}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(updateData);
    expect(res.status).toEqual(404);
    expect(res.body.error).toEqual('Not Found');
  });

  it('Should not update specialization preference #Unauthorized (PATCH) /api/specialization-preference/id', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/specialization-preference/${specializationParentId}`)
      .set('Content-Type', 'application/json')
      .send(updateData);
    expect(res.status).toEqual(401);
    expect(res.body.message).toEqual(['Unauthorized']);
  });

  it('Should get specific specialization preference (GET) /api/specialization-preference/id', async () => {
    const res = await request(app.getHttpServer()).get(
      `/specialization-preference/${specializationParentId}`,
    );
    expect(res.status).toEqual(200);
    expect(res.body.message).toEqual('Specialization retrieval success');
  });

  it('Should get all specialization preference (GET) /api/specialization-preference', async () => {
    const res = await request(app.getHttpServer()).get(
      `/specialization-preference?limit=10&page=1`,
    );
    expect(res.status).toEqual(200);
    expect(res.body.message).toEqual('Specializations retrieval success');
  });

  it('Should delete specialization (DELETE) /api/specialization-preference/id', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/specialization-preference/${specializationParentId}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      );
    expect(res.status).toEqual(200);
    expect(res.body.message).toEqual('Specialization deletion success');
  });

  it('Should not delete specialization preference #Unauthorized (DELETE) /api/specialization-preference/id', async () => {
    const res = await request(app.getHttpServer()).delete(
      `/specialization-preference/${specializationParentId}`,
    );
    expect(res.status).toEqual(401);
    expect(res.body.message).toEqual(['Unauthorized']);
  });

  it('Should not delete specialization preference #Not found (DELETE) /api/specialization-preference/id', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/specialization-preference/${100}`)
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
