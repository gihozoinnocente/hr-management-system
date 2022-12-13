import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { AppController } from './../src/app.controller';
import { AppService } from './../src/app.service';
import { adminCredentials } from './mockdata';
import { LanguageDto } from '../src/preference/dto/language.dto';
import * as cookieParser from 'cookie-parser';
import * as cookie from 'cookie-parse';

describe('Language Preference (e2e)', () => {
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

  const language: LanguageDto = {
    name: 'some language',
  };
  let languageId: number;
  const updateData: LanguageDto = {
    name: 'some update',
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

  it('Should add language preference (POST) /api/language-preference', async () => {
    const res = await request(app.getHttpServer())
      .post('/language-preference')
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(language);
    languageId = res.body.payload.id;
    expect(res.status).toEqual(201);
    expect(res.body.message).toEqual('Language added successfully');
  });

  it('Should not add language preference #Unauthorized (POST) /api/language-preference', async () => {
    const res = await request(app.getHttpServer())
      .post('/language-preference')
      .set('Content-Type', 'application/json')
      .send(language);
    expect(res.status).toEqual(401);
    expect(res.body.message).toEqual(['Unauthorized']);
  });

  it('Should update language preference (PATCH) /api/language-preference/id', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/language-preference/${languageId}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(updateData);
    expect(res.status).toEqual(200);
    expect(res.body.message).toEqual('Language updated successfully');
  });

  it('Should not update language preference (PATCH) /api/language-preference/id', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/language-preference/${100}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(updateData);
    expect(res.status).toEqual(404);
    expect(res.body.error).toEqual('Not Found');
  });

  it('Should not update language preference #Unauthorized (PATCH) /api/language-preference/id', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/language-preference/${languageId}`)
      .set('Content-Type', 'application/json')
      .send(updateData);
    expect(res.status).toEqual(401);
    expect(res.body.message).toEqual(['Unauthorized']);
  });

  it('Should get specific language preference (GET) /api/language-preference/id', async () => {
    const res = await request(app.getHttpServer()).get(
      `/language-preference/${languageId}`,
    );
    expect(res.status).toEqual(200);
    expect(res.body.message).toEqual('Language retrieval success');
  });

  it('Should get all language preference (GET) /api/language-preference', async () => {
    const res = await request(app.getHttpServer()).get(`/language-preference`);
    expect(res.status).toEqual(200);
    expect(res.body.message).toEqual('Languages retrieval success');
  });

  it('Should delete language (DELETE) /api/language-preference/id', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/language-preference/${languageId}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      );
    expect(res.status).toEqual(200);
    expect(res.body.message).toEqual('Language deletion success');
  });

  it('Should not delete language preference #Unauthorized (DELETE) /api/language-preference/id', async () => {
    const res = await request(app.getHttpServer()).delete(
      `/language-preference/${languageId}`,
    );
    expect(res.status).toEqual(401);
    expect(res.body.message).toEqual(['Unauthorized']);
  });

  it('Should not delete language preference #Not found (DELETE) /api/language-preference/id', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/language-preference/${100}`)
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
