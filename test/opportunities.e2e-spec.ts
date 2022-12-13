import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { AppController } from './../src/app.controller';
import { AppService } from './../src/app.service';
import { adminCredentials } from './mockdata';
import * as cookieParser from 'cookie-parser';
import * as cookie from 'cookie-parse';

describe('Opportunities (e2e)', () => {
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

  const opportunity = {
    title: 'CV-Support',
    type: 'job',
    description: 'Some description goes here',
    program: 1,
    partner: 2,
    target: {
      province: 'Kigali',
      district: 'Gasabo',
    },
    pointOfContact: 'pointofcontact@gmail.com',
    schedule: [
      {
        day: '2022-03-20',
        start: '8:30',
        end: '18:59',
        maximumParticipant: '20',
      },
      {
        day: '2022-03-21',
        start: '8:30',
        end: '18:59',
        maximumParticipant: '15',
      },
      {
        day: '2022-03-22',
        start: '8:30',
        end: '18:59',
        maximumParticipant: '25',
      },
    ],
    published: false,
  };

  let opportunityId: number;

  const updateData = {
    title: 'CV-Support some data',
    description: 'Some description goes here update',
    pointOfContact: 'pointofcontact-update@gmail.com',
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

  it('Should create Opportunity (POST) /api/opportunities', async () => {
    const res = await request(app.getHttpServer())
      .post('/opportunities/')
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(opportunity);
    opportunityId = res.body.payload.id;
    expect(res.status).toEqual(201);
  });

  it('Should not create Opportunity #Unauthorized (POST) /api/opportunities', async () => {
    const res = await request(app.getHttpServer())
      .post('/opportunities')
      .set('Content-Type', 'application/json')
      .send(opportunity);
    expect(res.status).toEqual(401);
  });

  // it('Should update Opportunity (PATCH) /api/opportunities/id', async () => {
  //     const res = await request(app.getHttpServer())
  //         .patch(`/opportunities/${opportunityId}`)
  //         .set(
  //             'cookie',
  //             `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
  //         )
  //         .set('Content-Type', 'application/json')
  //         .send(updateData);
  //     expect(res.status).toEqual(200);
  // });

  it('Should not update Opportunity (PATCH) /api/opportunities/id', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/opportunities/${100}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(updateData);
    expect(res.status).toEqual(404);
  });

  it('Should not update Opportunity #Unauthorized (PATCH) /api/opportunities/id', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/opportunities/${opportunityId}`)
      .set('Content-Type', 'application/json')
      .send(updateData);
    expect(res.status).toEqual(401);
  });

  it('Should publish Opportunity (PATCH) /api/opportunities/id', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/opportunities/publish/${opportunityId}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json');
    expect(res.status).toEqual(200);
  });

  it('Should not publish Opportunity (PATCH) /api/opportunities/id', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/opportunities/publish/${opportunityId}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json');
    expect(res.status).toEqual(400);
  });

  it('Should not update Opportunity (PATCH) /api/opportunities/id', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/opportunities/${opportunityId}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(updateData);
    expect(res.status).toEqual(400);
  });

  it('Should un publish Opportunity (PATCH) /api/opportunities/id', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/opportunities/un-publish/${opportunityId}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json');
    expect(res.status).toEqual(200);
  });

  it('Should not un publish Opportunity (PATCH) /api/opportunities/id', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/opportunities/un-publish/${opportunityId}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json');
    expect(res.status).toEqual(400);
  });

  it('Should get specific Opportunity (GET) /api/opportunities/id', async () => {
    const res = await request(app.getHttpServer())
      .get(`/opportunities/${opportunityId}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      );
    expect(res.status).toEqual(200);
  });

  it('Should get all Opportunities (GET) /api/opportunities', async () => {
    const res = await request(app.getHttpServer())
      .get(`/opportunities`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      );
    expect(res.status).toEqual(200);
  });

  it('Should delete Opportunity (DELETE) /api/opportunities/id', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/opportunities/${opportunityId}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      );
    expect(res.status).toEqual(200);
  });

  it('Should not delete Opportunity #Unauthorized (DELETE) /api/opportunities/id', async () => {
    const res = await request(app.getHttpServer()).delete(
      `/opportunities/${opportunityId}`,
    );
    expect(res.status).toEqual(401);
  });

  it('Should not delete Opportunity #Not found (DELETE) /api/opportunities/id', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/opportunities/${100}`)
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
