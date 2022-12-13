import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { AppController } from './../src/app.controller';
import { AppService } from './../src/app.service';
import { adminCredentials } from './mockdata';
import * as cookieParser from 'cookie-parser';
import * as cookie from 'cookie-parse';
import { ProgramDto } from '../src/preference/dto/programs.dto';

describe('Program Preference (e2e)', () => {
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

  const Program: ProgramDto = {
    name: 'Test Program',
  };
  const childProgramType: ProgramDto = {
    name: 'Child Program',
  };
  let ProgramParentId: number;
  const updateData: ProgramDto = {
    name: 'update-Program',
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

  it('Should add Program preference (POST) /api/program-preference', async () => {
    const res = await request(app.getHttpServer())
      .post('/program-preference')
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(Program);
    ProgramParentId = res.body.payload.id;
    expect(res.status).toEqual(201);
    expect(res.body.message).toEqual('Program preference added successfully');
  });

  it('Should add child Program preference (POST) /api/program-preference', async () => {
    const res = await request(app.getHttpServer())
      .post(`/program-preference/${ProgramParentId}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(childProgramType);
    expect(res.status).toEqual(201);
    expect(res.body.message).toEqual('Program preference added successfully');
  });

  it('Should not add Program preference #Unauthorized (POST) /api/program-preference', async () => {
    const res = await request(app.getHttpServer())
      .post('/program-preference')
      .set('Content-Type', 'application/json')
      .send(Program);
    expect(res.status).toEqual(401);
    expect(res.body.message).toEqual(['Unauthorized']);
  });

  it('Should update Program preference (PATCH) /api/program-preference/id', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/program-preference/${ProgramParentId}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(updateData);
    expect(res.status).toEqual(200);
    expect(res.body.message).toEqual('Program preference updated successfully');
  });

  it('Should not update Program preference (PATCH) /api/program-preference/id', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/program-preference/${100}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(updateData);
    expect(res.status).toEqual(404);
    expect(res.body.error).toEqual('Not Found');
  });

  it('Should not update Program preference #Unauthorized (PATCH) /api/program-preference/id', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/program-preference/${ProgramParentId}`)
      .set('Content-Type', 'application/json')
      .send(updateData);
    expect(res.status).toEqual(401);
    expect(res.body.message).toEqual(['Unauthorized']);
  });

  it('Should get specific Program preference (GET) /api/program-preference/id', async () => {
    const res = await request(app.getHttpServer()).get(
      `/program-preference/${ProgramParentId}`,
    );
    expect(res.status).toEqual(200);
    expect(res.body.message).toEqual('Program preference retrieval success');
  });

  it('Should get all Program preference (GET) /api/program-preference', async () => {
    const res = await request(app.getHttpServer()).get(`/program-preference`);
    expect(res.status).toEqual(200);
    expect(res.body.message).toEqual('Program preferences retrieval success');
  });

  it('Should delete Program (DELETE) /api/program-preference/id', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/program-preference/${ProgramParentId}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      );
    expect(res.status).toEqual(200);
    expect(res.body.message).toEqual('Program preference deletion success');
  });

  it('Should not delete Program preference #Unauthorized (DELETE) /api/program-preference/id', async () => {
    const res = await request(app.getHttpServer()).delete(
      `/program-preference/${ProgramParentId}`,
    );
    expect(res.status).toEqual(401);
    expect(res.body.message).toEqual(['Unauthorized']);
  });

  it('Should not delete Program preference #Not found (DELETE) /api/program-preference/id', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/program-preference/${100}`)
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
