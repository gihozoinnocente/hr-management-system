import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { AppController } from './../src/app.controller';
import { AppService } from './../src/app.service';
import { adminCredentials } from './mockdata';
import { CreateAssessmentDto } from '../src/assessment/dto/create-assessment.dto';
import { UpdateAssessmentDto } from '../src/assessment/dto/update-assessment.dto';
import * as cookieParser from 'cookie-parser';
import * as cookie from 'cookie-parse';

describe('Assessment (e2e)', () => {
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
  let gradingTypeId = 0;
  let assessmentId = 0;

  const assessmentData: CreateAssessmentDto = {
    title: 'English assessment',
    description: 'Some descriptions to go a long',
    gradingType: gradingTypeId,
  };

  const updateAssessmentData: UpdateAssessmentDto = {
    title: 'English assessment',
    description: 'Some descriptions to go a long',
    gradingType: gradingTypeId,
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

  it('Should not create assessment (POST) /api/assessment', async () => {
    const res = await request(app.getHttpServer())
      .post('/assessment')
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(assessmentData);
    expect(res.status).toEqual(404);
    expect(res.body.error).toEqual('Not Found');
  });

  it('Should get all Grading preference (GET) /api/grading-preference', async () => {
    const res = await request(app.getHttpServer())
      .get(`/grading-preference`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      );
    gradingTypeId = res.body.payload.items[1].id;
    assessmentData.gradingType = gradingTypeId;
    updateAssessmentData.gradingType = gradingTypeId;
    expect(res.status).toEqual(200);
    expect(res.body.message).toEqual('Grading preferences retrieval success');
  });

  it('Should create assessment (POST) /api/assessment', async () => {
    const res = await request(app.getHttpServer())
      .post('/assessment')
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(assessmentData);
    assessmentId = res.body.payload.id;
    expect(res.status).toEqual(201);
    expect(res.body.message).toEqual('Assessment created successfully');
  });

  it('Should not add assessment #Unauthorized (POST) /api/assessment', async () => {
    const res = await request(app.getHttpServer())
      .post('/assessment')
      .set('Content-Type', 'application/json')
      .send(assessmentData);
    expect(res.status).toEqual(401);
    expect(res.body.message).toEqual(['Unauthorized']);
  });

  it('Should update assessment (PATCH) /api/assessment/id', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/assessment/${assessmentId}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(updateAssessmentData);
    expect(res.status).toEqual(200);
    expect(res.body.message).toEqual('Assessment updated successfully');
  });

  it('Should not update assessment (PATCH) /api/assessment/id', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/assessment/${100}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(updateAssessmentData);
    expect(res.status).toEqual(404);
    expect(res.body.error).toEqual('Not Found');
  });

  it('Should not update assessment #Unauthorized (PATCH) /api/assessment/id', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/assessment/${assessmentId}`)
      .set('Content-Type', 'application/json')
      .send(updateAssessmentData);
    expect(res.status).toEqual(401);
    expect(res.body.message).toEqual(['Unauthorized']);
  });

  it('Should get specific Assessment (GET) /api/assessment/id', async () => {
    const res = await request(app.getHttpServer())
      .get(`/assessment/${assessmentId}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      );
    expect(res.status).toEqual(200);
    expect(res.body.message).toEqual('Assessment retrieved successfully');
  });

  it('Should get all assessments (GET) /api/assessment', async () => {
    const res = await request(app.getHttpServer())
      .get(`/assessment`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      );
    expect(res.status).toEqual(200);
    expect(res.body.message).toEqual('Assessments retrieved successfully');
  });

  it('Should grade (POST) /api/assessment ', async () => {
    const res = await request(app.getHttpServer())
      .post(`/assessment/${assessmentId}`)
      .set('Content-Type', 'application/json')
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .send({
        candidateId: 3,
        grade: '90%',
      });
    expect(res.status).toEqual(201);
  });

  it('Should grade (POST) /api/assessment ', async () => {
    const res = await request(app.getHttpServer())
      .post(`/assessment/${assessmentId}`)
      .set('Content-Type', 'application/json')
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .send({
        candidateId: 3,
        grade: '95%',
      });
    expect(res.status).toEqual(201);
  });

  it('Should Not grade (POST) Candidate not found /api/assessment ', async () => {
    const res = await request(app.getHttpServer())
      .post(`/assessment/${assessmentId}`)
      .set('Content-Type', 'application/json')
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .send({
        candidateId: 1000,
        grade: '95%',
      });
    expect(res.status).toEqual(404);
  });

  it('Should not grade (POST) Not Found /api/assessment ', async () => {
    const res = await request(app.getHttpServer())
      .post(`/assessment/${1000}`)
      .set('Content-Type', 'application/json')
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .send({
        candidateId: 3,
        grade: '90%',
      });
    expect(res.status).toEqual(404);
  });

  it('Should get candidate Assessment grades (GET) /api/assessment/id', async () => {
    const res = await request(app.getHttpServer())
      .get(`/assessment/candidate/${3}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      );
    expect(res.status).toEqual(200);
  });

  it('Should delete assessment (DELETE) /api/assessment/id', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/assessment/${assessmentId}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      );
    expect(res.status).toEqual(200);
    expect(res.body.message).toEqual('Assessment deleted successfully');
  });

  it('Should not delete assessment #Unauthorized (DELETE) /api/assessment/id', async () => {
    const res = await request(app.getHttpServer()).delete(
      `/assessment/${assessmentId}`,
    );
    expect(res.status).toEqual(401);
    expect(res.body.message).toEqual(['Unauthorized']);
  });

  it('Should not delete assessment #Not found (DELETE) /api/assessment/id', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/assessment/${100}`)
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
