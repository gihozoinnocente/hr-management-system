import { LoginDto } from '../src/auth/dto/login.dto';
import { EmploymentStatusEnum } from '../src/shared/enums/employment-status.enum';

export const resetEmail = {
  username: 'tunezepatrick@awesomity.rw',
};

export const resetPhone = {
  username: '+250781429268',
};

export const ifResetEmailNotExist = {
  username: 'notexisting@gmail.com',
};

export const resetPassword = {
  password: `Admin@128`,
};

export const prevPassword = {
  password: 'admin@123',
};
export const validCandidateData = {
  email: 'candidate@gmail.com',
  password: 'Callhim@153',
  firstName: 'Habimana',
  lastName: 'Celestin',
  gender: 'm',
  joinedFrom: 'online',
  phoneNumber: '+250780000000',
  verifyBy: 'email',
  agreed: true,
};

export const adminCredentials: LoginDto = {
  username: 'tunezepatrick@awesomity.rw',
  password: 'admin@123',
};

export const candidateCredentials: LoginDto = {
  username: 'kabayizayannick@awesomity.rw',
  password: 'candidate@123',
};

export const profileCreateData = {
  nationalId: '1620394832012223',
  dateOfBirth: '2000-01-01',
  whatsAppNumber: '+250784910000',
  province: 'Kigali',
  district: 'Kicukiro',
  sector: 'Kicukiro',
  accessToSmartPhone: true,
  accessToPc: true,
};

export const profileUpdateData = {
  accessToSmartPhone: false,
  drivingLisence: ['A'],
};

export const educationCreateData = {
  level: 1,
  institution: 'AUCA',
  fieldOfStudy: 1,
  from: '2016-01-01',
  to: '2018-01-01',
};

export const educationUpdateData = {
  level: 1,
  institution: 'AUCA 2',
  fieldOfStudy: 2,
  from: '2016-01-01',
  to: '2018-01-01',
};

export const trainingCreateData = {
  training: 'AWS Solution Architect',
  provider: 'AWS',
  from: '2016-01-01',
  to: '2018-01-01',
};

export const trainingUpdateData = {
  training: 'AWS Practitioner',
  provider: 'AWS',
  from: '2016-01-01',
  to: '2018-01-01',
};

export const languageCreateData = {
  name: [1],
};
export const interestCreateData = {
  interests: [1, 2, 3],
};

export const employmentJourneyCreateData = {
  workStatus: EmploymentStatusEnum.TRAINING,
  whichSectorIsYourTrainingIn: 'ict',
  whatCompanyOrOrganization: 'Awesomity Lab',
  isCurrentStatus: true,
  from: '2020-01-12',
  to: '2022-05-16',
};
export const employmentJourneyUpdateData = {
  workStatus: EmploymentStatusEnum.SELF_EMPLOYED,
  whatDoYouDoToMakeMoney: 'I sell goods',
  tellUsMoreAboutTheTypeOfWorkYouDo: 'Some more tasks are done',
  isCurrentStatus: true,
  howMuchDoYouMakePerMonth: '200-300K',
  from: '2020-01-12',
};
