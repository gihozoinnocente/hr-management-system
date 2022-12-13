import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { AppController } from './../src/app.controller';
import { AppService } from './../src/app.service';
import { resetEmail, ifResetEmailNotExist } from './mockdata';
import { User } from './../src/users/entities/user.entity';
import { Repository } from 'typeorm';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let userId: any;
  let prevPass: string;
  let roleRepo: Repository<User>;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [AppService],
      controllers: [AppController],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (POST) reset email does not exist', async (done) => {
    request(app.getHttpServer())
      .post('/auth/forgot-password')
      .send(ifResetEmailNotExist)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(404)
      .end(function (err) {
        if (err) return done(err);
        return done();
      });
  });

  it('/ (POST) send reset email', async (done) => {
    request(app.getHttpServer())
      .post('/auth/forgot-password')
      .send(resetEmail)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function (err) {
        if (err) return done(err);
        return done();
      });
  });

  afterAll(async (done) => {
    roleRepo = app.get('UserRepository');
    await roleRepo.update(
      { id: userId },
      {
        password: prevPass,
      },
    );
    await app.close();
    done();
  });
});
