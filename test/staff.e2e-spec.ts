import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { AppController } from './../src/app.controller';
import { AppService } from './../src/app.service';
import { adminCredentials } from './mockdata';
import { CreateStaffDto } from '../src/staff/dto/create-staff.dto';
import { UserRole } from '../src/shared/enums/user-roles.enum';
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

  const staffInfo: CreateStaffDto = {
    email: 'testuser@harambee.com',
    firstName: 'test-staff',
    lastName: 'test-staff',
    phoneNumber: '+250780605309',
    role: UserRole.EDITOR,
  };

  let staffId;

  let authCookies: Record<string, string>;

  it('Should login the admin {/api/auth/admin-login, POST}', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/admin-login')
      .set('Content-Type', 'application/json')
      .send(adminCredentials);
    authCookies = cookie.parse(res.headers['set-cookie'].join(';'));
    expect(res.status).toEqual(201);
  });

  it('Should not add staff (Unauthorized) /api/staff', async () => {
    const res = await request(app.getHttpServer())
      .post('/staff')
      .set('Content-Type', 'application/json')
      .send(staffInfo);
    expect(res.status).toEqual(401);
  });

  it('Should add staff (POST) /api/staff', async () => {
    const res = await request(app.getHttpServer())
      .post('/staff')
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(staffInfo);
    staffId = res.body.payload.id;
    expect(res.status).toEqual(201);
    expect(res.body.message).toEqual('Staff Created successfully');
  });

  it('Should not add staff (Already exist) /api/staff', async () => {
    const res = await request(app.getHttpServer())
      .post('/staff')
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(staffInfo);
    expect(res.status).toEqual(409);
  });

  it('Should not get all staff #Unauthorized (GET) /api/staff', async () => {
    const res = await request(app.getHttpServer()).get(`/staff/`);
    expect(res.status).toEqual(401);
  });

  it('Should get all staff (GET) /api/staff', async () => {
    const res = await request(app.getHttpServer())
      .get(`/staff/`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      );
    expect(res.status).toEqual(200);
    expect(res.body.message).toEqual('All staff retrieved successfully');
  });

  it('Should not get specific staff #Unauthorized (GET) /api/staff', async () => {
    const res = await request(app.getHttpServer()).get(`/staff/${staffId}`);
    expect(res.status).toEqual(401);
  });

  it('Should get specific staff (GET) /api/staff', async () => {
    const res = await request(app.getHttpServer())
      .get(`/staff/${9000}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      );
    expect(res.status).toEqual(404);
  });

  it('Should get specific staff (GET) /api/staff', async () => {
    const res = await request(app.getHttpServer())
      .get(`/staff/${staffId}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      );
    expect(res.status).toEqual(200);
    expect(res.body.message).toEqual('staff retrieved successfully');
  });

  it('Should not activate staff #Unauthorized (PATCH) /api/staff', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/staff/activate/${staffId}`)
      .set('Content-Type', 'application/json');
    expect(res.status).toEqual(401);
  });

  it('Should not activate staff (PATCH) /api/staff', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/staff/activate/${9000}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      );
    expect(res.status).toEqual(404);
  });

  it('Should not activate staff (PATCH) /api/staff', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/staff/activate/${staffId}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      );
    expect(res.status).toEqual(400);
  });

  it('Should not deactivate staff #Unauthorized (PATCH) /api/staff', async () => {
    const res = await request(app.getHttpServer()).patch(
      `/staff/deactivate/${staffId}`,
    );
    expect(res.status).toEqual(401);
  });

  it('Should not deactivate staff (PATCH) /api/staff', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/staff/deactivate/${9000}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      );
    expect(res.status).toEqual(404);
  });

  it('Should deactivate staff (PATCH) /api/staff', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/staff/deactivate/${staffId}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      );
    expect(res.status).toEqual(200);
  });

  it('Should activate staff (PATCH) /api/staff', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/staff/activate/${staffId}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      );
    expect(res.status).toEqual(200);
  });

  it('Should delete staff #Unauthorized (DELETE) /api/staff', async () => {
    const res = await request(app.getHttpServer()).delete(`/staff/${staffId}`);
    expect(res.status).toEqual(401);
  });

  it('Should delete staff (DELETE) /api/staff', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/staff/${9000}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      );
    expect(res.status).toEqual(404);
  });

  it('Should delete staff (DELETE) /api/staff', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/staff/${staffId}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      );
    expect(res.status).toEqual(200);
    expect(res.body.message).toEqual('Staff deleted successfully');
  });

  afterAll(async (done) => {
    await app.close();
    done();
  });
});
