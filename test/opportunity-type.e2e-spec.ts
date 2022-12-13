import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { AppController } from './../src/app.controller';
import { AppService } from './../src/app.service';
import { OpportunityTypeDto } from '../src/preference/dto/opportunity-type.dto';
import { adminCredentials } from './mockdata';
import * as cookieParser from 'cookie-parser';
import * as cookie from 'cookie-parse';

describe('Opportunity Type Preference (e2e)', () => {
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

  const opprtunityType: OpportunityTypeDto = {
    name: 'Opportunity1',
  };
  let opportunityTypeId: number;
  const updateData: OpportunityTypeDto = {
    name: 'Opportunity2',
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

  it('Should add Opportunity Type preference (POST) /api/opportunity-types', async () => {
    const res = await request(app.getHttpServer())
      .post('/opportunity-types')
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(opprtunityType);
    opportunityTypeId = res.body.payload.id;
    expect(res.status).toEqual(201);
    expect(res.body.message).toEqual('Opportunity Type added successfully');
  });

  it('Should not add Opportunity Type preference #Unauthorized (POST) /api/opportunity-types', async () => {
    const res = await request(app.getHttpServer())
      .post('/opportunity-types')
      .set('Content-Type', 'application/json')
      .send(opprtunityType);
    expect(res.status).toEqual(401);
    expect(res.body.message).toEqual(['Unauthorized']);
  });

  it('Should update Opportunity Type preference (PATCH) /api/opportunity-types/id', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/opportunity-types/${opportunityTypeId}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(updateData);
    expect(res.status).toEqual(200);
    expect(res.body.message).toEqual('Opportunity Type updated successfully');
  });

  it('Should not update Opportunity Type preference (PATCH) /api/opportunity-types/id', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/opportunity-types/${100}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(updateData);
    expect(res.status).toEqual(404);
    expect(res.body.error).toEqual('Not Found');
  });

  it('Should not update Opportunity Type preference #Unauthorized (PATCH) /api/opportunity-types/id', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/opportunity-types/${opportunityTypeId}`)
      .set('Content-Type', 'application/json')
      .send(updateData);
    expect(res.status).toEqual(401);
    expect(res.body.message).toEqual(['Unauthorized']);
  });

  it('Should get specific Opportunity Type preference (GET) /api/opportunity-types/id', async () => {
    const res = await request(app.getHttpServer()).get(
      `/opportunity-types/${opportunityTypeId}`,
    );
    expect(res.status).toEqual(200);
    expect(res.body.message).toEqual('Opportunity Type retrieval success');
  });

  it('Should get all Opportunity Types preference (GET) /api/opportunity-types', async () => {
    const res = await request(app.getHttpServer()).get(`/opportunity-types`);
    expect(res.status).toEqual(200);
    expect(res.body.message).toEqual('Opportunity Types retrieval success');
  });

  it('Should delete Opportunity Types (DELETE) /api/opportunity-types/id', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/opportunity-types/${opportunityTypeId}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      );
    expect(res.status).toEqual(200);
    expect(res.body.message).toEqual('Opportunity Type deletion success');
  });

  it('Should not delete Opportunity Types preference #Unauthorized (DELETE) /api/opportunity-types/id', async () => {
    const res = await request(app.getHttpServer()).delete(
      `/opportunity-types/${opportunityTypeId}`,
    );
    expect(res.status).toEqual(401);
    expect(res.body.message).toEqual(['Unauthorized']);
  });

  it('Should not delete Opportunity Types preference #Not found (DELETE) /api/opportunity-types/id', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/opportunity-types/${100}`)
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
