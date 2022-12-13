import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { AppController } from './../src/app.controller';
import { AppService } from './../src/app.service';
import { adminCredentials } from './mockdata';
import { Gender } from '../src/shared/enums/gender.enum';
import { SocialClass } from '../src/shared/enums/social-class.enum';
import { DrivingLisence } from '../src/shared/enums/driving-lisence.enum';
import { JoinedFrom } from '../src/shared/enums/joined-from.enum';
import { ContactMethod } from '../src/shared/enums/contact-method.enum';
import { EmploymentStatusEnum } from '../src/shared/enums/employment-status.enum';
import * as cookieParser from 'cookie-parser';
import * as cookie from 'cookie-parse';

describe('Candidate management (e2e)', () => {
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

  const genrateRandom = (): number => {
    return Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000;
  };

  const candidateData = {
    firstName: 'Fcandidate',
    lastName: 'lCandidate',
    gender: Gender.FEMALE,
    dateOfBirth: '2000-02-15',
    nationalId: `22222222222${genrateRandom()}`,
    socialClass: SocialClass.CLASS_A,
    email: 'mockemail@harambee.com',
    phoneNumber: `+2507832${genrateRandom()}`,
    whatsAppNumber: `+250783256987${genrateRandom()}`,
    province: 'Province',
    district: 'District',
    sector: 'Sector',
    drivingLisence: [DrivingLisence.CATEGORY_A, DrivingLisence.CATEGORY_B],
    howDidYouHearAboutHarambee: JoinedFrom.ONLINE,
    contactMethod: ContactMethod.EMAIL,
    accessToSmartPhone: true,
    accessToPc: true,
  };

  let candidateId: number;

  const updateCandidate = {
    firstName: 'Fcandidate',
    lastName: 'lCandidate',
    gender: Gender.MALE,
    dateOfBirth: '2000-02-15',
    nationalId: `22222222222${genrateRandom()}`,
    socialClass: SocialClass.CLASS_C,
    email: 'mockemail@harambee.com',
    phoneNumber: `+2507832${genrateRandom()}`,
    whatsAppNumber: `+250783256987${genrateRandom()}`,
    province: 'Kigali',
    district: 'Kicukiro',
    sector: 'Kicukiro',
    drivingLisence: [DrivingLisence.CATEGORY_A],
    howDidYouHearAboutHarambee: JoinedFrom.RADIO,
    contactMethod: ContactMethod.WHATSAPP,
    accessToSmartPhone: false,
    accessToPc: true,
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

  it('Should add new candidate POST', async () => {
    const res = await request(app.getHttpServer())
      .post('/candidates')
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(candidateData);
    candidateId = res.body.payload.id;
    expect(res.status).toEqual(201);
  });

  it('Should not add new candidate (Unauthorized) POST', async () => {
    const res = await request(app.getHttpServer())
      .post('/candidates')
      .set('Content-Type', 'application/json')
      .send(candidateData);
    expect(res.status).toEqual(401);
  });

  it('Should not update candidate (Unauthorized) PATCH', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/candidates/${candidateId}`)
      .set('Content-Type', 'application/json')
      .send(updateCandidate);
    expect(res.status).toEqual(401);
  });

  it('Should not update candidate (Not Found) PATCH', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/candidates/${100}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(updateCandidate);
    expect(res.status).toEqual(404);
  });

  it('Should update candidate PATCH', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/candidates/${candidateId}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(updateCandidate);
    expect(res.status).toEqual(200);
  });

  it('Should not get all candidates (Unauthorized) GET', async () => {
    const res = await request(app.getHttpServer())
      .get(`/candidates`)
      .set('Content-Type', 'application/json');
    expect(res.status).toEqual(401);
  });

  it('Should get all candidates GET', async () => {
    const res = await request(app.getHttpServer())
      .get(`/candidates`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json');
    expect(res.status).toEqual(200);
  });

  it('Should get all candidates GET', async () => {
    const res = await request(app.getHttpServer())
      .get(`/candidates?limit=${5}&page=${1}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json');
    expect(res.status).toEqual(200);
  });

  it('Should not get one candidate (Unauthorized) GET', async () => {
    const res = await request(app.getHttpServer())
      .get(`/candidates/${candidateId}`)
      .set('Content-Type', 'application/json');
    expect(res.status).toEqual(401);
  });

  it('Should not get one candidate (Not Found) GET', async () => {
    const res = await request(app.getHttpServer())
      .get(`/candidates/${1000}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json');
    expect(res.status).toEqual(404);
  });

  it('Should get one candidate GET', async () => {
    const res = await request(app.getHttpServer())
      .get(`/candidates/${candidateId}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json');
    expect(res.status).toEqual(200);
  });

  // it('Should search candidates GET', async () => {
  //     const res = await request(app.getHttpServer())
  //         .get(`/candidates/search?query=${+250}`)
  //         .set(
  //             'cookie',
  //             `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
  //         )
  //         .set('Content-Type', 'application/json');
  //     expect(res.status).toEqual(200);
  // });

  it('Should not delete candidate (Not Found) DELETE', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/candidates/${100}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(candidateData);
    expect(res.status).toEqual(404);
  });

  it('Should delete candidate DELETE', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/candidates/${candidateId}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(candidateData);
    expect(res.status).toEqual(200);
  });

  const workData = {
    workStatus: EmploymentStatusEnum.TRAINING,
    whichSectorIsYourTrainingIn: 'ict',
    whatCompanyOrOrganization: 'Awesomity Lab',
    from: '2020-01-12',
    to: '2022-05-16',
  };

  let workId: number;

  const updateWorkData = {
    workStatus: EmploymentStatusEnum.SELF_EMPLOYED,
    whatDoYouDoToMakeMoney: 'I sell goods',
    tellUsMoreAboutTheTypeOfWorkYouDo: 'Some more tasks are done',
    howMuchDoYouMakePerMonth: '200-300K',
    isCurrentStatus: true,
    from: '2020-01-12',
  };

  // it('Should not add candidate work history (Not Found) POST', async () => {
  //     const res = await request(app.getHttpServer())
  //         .post(`/candidates/${1000}/work`)
  //         .set(
  //             'cookie',
  //             `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
  //         )
  //         .set('Content-Type', 'application/json')
  //         .send(candidateData);
  //     expect(res.status).toEqual(404);
  // });

  it('Should not add candidate work history (Unauthorized) POST', async () => {
    const res = await request(app.getHttpServer())
      .post(`/candidates/${candidateId}/work`)
      .set('Content-Type', 'application/json')
      .send(candidateData);
    expect(res.status).toEqual(401);
  });

  it('Should add candidate work history POST', async () => {
    const res = await request(app.getHttpServer())
      .post(`/candidates/${candidateId}/work`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(workData);
    workId = res.body.payload.id;
    expect(res.status).toEqual(201);
  });

  it('Should not update candidate work history (Not Found) PATCH', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/candidates/work/${9000}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(updateWorkData);
    expect(res.status).toEqual(404);
  });

  it('Should not update candidate work history (Unauthorized) PATCH', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/candidates/work/${workId}`)
      .set('Content-Type', 'application/json')
      .send(updateWorkData);
    expect(res.status).toEqual(401);
  });

  it('Should update candidate work history PATCH', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/candidates/work/${workId}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(updateWorkData);
    console.log(res.body);
    expect(res.status).toEqual(200);
  });

  it('Should not delete candidate work history DELETE', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/candidates/work/${9000}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(updateWorkData);
    expect(res.status).toEqual(404);
  });

  it('Should delete candidate work history DELETE', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/candidates/work/${workId}`)
      .set('Content-Type', 'application/json')
      .send(updateWorkData);
    expect(res.status).toEqual(401);
  });

  it('Should delete candidate work history DELETE', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/candidates/work/${workId}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json');
    expect(res.status).toEqual(200);
  });

  const educationData = {
    level: 1,
    institution: 'AUCA 2',
    fieldOfStudy: 2,
    from: '2016-01-01',
    to: '2018-01-01',
  };

  let educationId: number;

  const updateEducationData = {
    level: 1,
    institution: 'AUCA',
    fieldOfStudy: 1,
    from: '2016-01-01',
    to: '2018-01-01',
  };

  it('Should not add candidate education history (Unauthorized) POST', async () => {
    const res = await request(app.getHttpServer())
      .post(`/candidates/${candidateId}/education`)
      .set('Content-Type', 'application/json')
      .send(educationData);
    expect(res.status).toEqual(401);
  });

  it('Should not add candidate education history (Not Found) POST', async () => {
    const res = await request(app.getHttpServer())
      .post(`/candidates/${9000}/education`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(educationData);
    expect(res.status).toEqual(404);
  });

  it('Should add candidate education history POST', async () => {
    const res = await request(app.getHttpServer())
      .post(`/candidates/${candidateId}/education`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(educationData);
    educationId = res.body.payload.id;
    expect(res.status).toEqual(201);
  });

  it('Should not update candidate education history (Unauthorized) PATCH', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/candidates/education/${educationId}`)
      .set('Content-Type', 'application/json')
      .send(updateEducationData);
    expect(res.status).toEqual(401);
  });

  it('Should not update candidate education history (Not found) PATCH', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/candidates/education/${9000}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(updateEducationData);
    expect(res.status).toEqual(404);
  });

  it('Should update candidate education history PATCH', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/candidates/education/${educationId}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(updateEducationData);
    expect(res.status).toEqual(200);
  });

  it('Should not delete candidate education history (Unauthorized) DELETE', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/candidates/education/${educationId}`)
      .set('Content-Type', 'application/json');
    expect(res.status).toEqual(401);
  });

  it('Should not delete candidate education history (Not Found) DELETE', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/candidates/education/${9000}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json');
    expect(res.status).toEqual(404);
  });

  it('Should delete candidate education history DELETE', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/candidates/education/${educationId}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json');
    expect(res.status).toEqual(200);
  });

  const trainingData = {
    training: 'AWS Solution Architect',
    provider: 'AWS',
    from: '2016-01-01',
    to: '2018-01-01',
  };

  let trainingId: number;

  const updateTrainingData = {
    training: 'AWS Practitioner',
    provider: 'AWS',
    from: '2016-01-01',
    to: '2018-01-01',
  };

  it('Should not add candidate training history (Unauthorized) POST', async () => {
    const res = await request(app.getHttpServer())
      .post(`/candidates/${candidateId}/training`)
      .set('Content-Type', 'application/json')
      .send(trainingData);
    expect(res.status).toEqual(401);
  });

  it('Should not add candidate training history (Not Found) POST', async () => {
    const res = await request(app.getHttpServer())
      .post(`/candidates/${9000}/training`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(trainingData);
    expect(res.status).toEqual(404);
  });

  it('Should add candidate training history POST', async () => {
    const res = await request(app.getHttpServer())
      .post(`/candidates/${candidateId}/training`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(trainingData);
    trainingId = res.body.payload.id;
    expect(res.status).toEqual(201);
  });

  it('Should not update candidate training history (Unauthorized) PATCH', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/candidates/training/${trainingId}`)
      .set('Content-Type', 'application/json')
      .send(updateTrainingData);
    expect(res.status).toEqual(401);
  });

  it('Should not update candidate training history (Not Found) PATCH', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/candidates/training/${9000}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(updateTrainingData);
    expect(res.status).toEqual(404);
  });

  it('Should update candidate training history PATCH', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/candidates/training/${trainingId}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json')
      .send(updateTrainingData);
    expect(res.status).toEqual(200);
  });

  it('Should not delete candidate training history (Unauthorized) DELETE', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/candidates/training/${trainingId}`)
      .set('Content-Type', 'application/json');
    expect(res.status).toEqual(401);
  });

  it('Should not delete candidate training history (Not Found) DELETE', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/candidates/training/${9000}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json');
    expect(res.status).toEqual(404);
  });

  it('Should delete candidate training history DELETE', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/candidates/training/${trainingId}`)
      .set(
        'cookie',
        `accessToken=${authCookies['accessToken']}; refreshToken=${authCookies['refreshToken']}`,
      )
      .set('Content-Type', 'application/json');
    expect(res.status).toEqual(200);
  });

  afterAll(async (done) => {
    await app.close();
    done();
  });
});
