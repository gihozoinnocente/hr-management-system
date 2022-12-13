import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
  HttpException, 
  HttpStatus, 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { SendGrindService } from '../notifications/sendgrid.service';
import { Connection } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { BcryptService } from '../shared/util/bcrypt.service';
import { ConfigService } from '@nestjs/config';
import { SmsService } from '../notifications/sms.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { omit } from 'lodash';
import { codeGenerator } from 'src/shared/util/code-generator';
import { addDays, formatISO, isBefore } from 'date-fns';
import { VerifyBy } from 'src/shared/enums/verify.enum';
import { ACCOUNT_ALREADY_VERIFIED, INVALID_VERIFICATION_CODE, VERIFICATION_CODE_EXPIRED, VERIFICATION_EMAIL_SUBJECT } from 'src/shared/constants/auth.constants';

import { TokenPayload } from './interfaces/jwt.payload.interface';
import { USER_NOT_FOUND } from 'src/shared/constants/user.constants';
import { EMAIL_REGEX } from 'src/shared/constants/regex.constant';
import { Code } from 'src/users/entities/code.entity';
import { from, Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import * as bcrypt from 'bcrypt';


@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Code)
    private readonly verificationCodeRepository: Repository<Code>,
   private readonly jwtService: JwtService,
    private readonly sendGridService: SendGrindService,
    //private readonly connection: Connection,
   // private readonly smsService: SmsService,
    private readonly configService: ConfigService,
    private readonly bcryptService: BcryptService,
  ) {}

  async registrUser(user: CreateUserDto): Promise<any>{
    user.password = await this.bcryptService.hash(user.password);
    if(! await this.checkUserExisting(user.email)){
     if(await this.bcryptService.compare(user.confirmPassword,user.password)){
      const createdUser = await this.userRepository.save(user)
      const verificationCode: string = codeGenerator();
      const verificationCodeEntry = {
        code: verificationCode,
        expiryDate: formatISO(new Date(addDays(new Date(), 1)), {
          representation: 'complete',
        }),
        user: createdUser,
      };
     const userVerificationCode = await this.verificationCodeRepository.save(
       
        verificationCodeEntry,
      );
      if (user.verifyBy === VerifyBy.EMAIL) {
        const body : string="Hello "+user.first_name+" Please verify your account by entering this code: "+userVerificationCode.code
        const verificationMail = {
          to: user.email,
          subject: VERIFICATION_EMAIL_SUBJECT,
          from: this.configService.get<string>('SENT_EMAIL_FROM'),
          text:body,
          html: "<h1>"+body+"</h1>",
        };
        await this.sendGridService.send(verificationMail);
        return "Verification code sent to your email";
      }
      return omit(createdUser, ['password'])
     }else{
      throw new ConflictException("passwords don't match");
     }
       }else{
      throw new ConflictException('User already exist.')
    }
  }
  async checkUserExisting(email: string): Promise<boolean>{
    const user = await this.userRepository.findOne({email: email});
    //console.log(user)
    if (user) {
      return true
    } else {
      return false
    }
  }
   /*async requestVerification(
      emailorPhone:string
    ): Promise<void> {
      
      const user = await this.findUserByEmailOrPhoneNumber(emailorPhone);
      if (!user) {
        throw new UnauthorizedException(USER_NOT_FOUND);
      }
      if (user.isVerified) {
        throw new BadRequestException(ACCOUNT_ALREADY_VERIFIED);
      }
      const verificationCodeEntry = {
        code: codeGenerator(),
        expiryDate: formatISO(new Date(addDays(new Date(), 1)), {
          representation: 'complete',
        }),
        user: user,
      };
     await this.verificationCodeRepository.delete({ user: user });
      const verificationCode = await this.verificationCodeRepository.save(
        verificationCodeEntry,
      );
      if (this.checkDataIsEmail(emailorPhone)) {
         const body : string="Hello "+user.firstName+", Please verify your account by entering this code: "+verificationCode.code
        const verificationMail = {
          to: user.email,
          subject: VERIFICATION_EMAIL_SUBJECT,
          from: process.env.SENT_EMAIL_FROM,
          text: body,
          html: "<h1>"+body+"</h2>",
        };
        await this.sendGridService.send(verificationMail);
      }
  
     
    }
    async findUserByEmailOrPhoneNumber(emailorPhone: string):Promise<User> {
      if (
        !this.checkDataIsEmail(emailorPhone) &&
        !this.checkDataIsPhone(emailorPhone)
      ) {
        throw new BadRequestException('Please use either email or phonenumber');
      }
      let user = new User();
      if (this.checkDataIsEmail(emailorPhone)) {
        user = await this.userRepository.findOne({
          email: emailorPhone,
        });
      }
      if (this.checkDataIsPhone(emailorPhone)) {
        user = await this.userRepository.findOne({
          phoneNumber: emailorPhone,
        });
      }
      return user;
    }
    checkDataIsEmail(email: string): boolean {
      if (EMAIL_REGEX.test(email)) {
        return true;
      } else {
        return false;
      }
    }
  
    checkDataIsPhone(phone: string): boolean {
      phone = phone.split(' ').join('');
      if (phone.startsWith('+250') && phone.length === 13) {
        return true;
      } else {
        return false;
      }
    }
  async verification(code:string): Promise<any> {
    
    const result = await this.verificationCodeRepository.findOne({
      where: { code: code},
      relations: ['user'],
    });
    if (!result) {
      throw new UnauthorizedException(INVALID_VERIFICATION_CODE);
    }
    if (!(await this.checkCodeExpiry(result))) {
      throw new UnauthorizedException(VERIFICATION_CODE_EXPIRED);
    }
    await this.userRepository.update(
      { id: result.user.id },
      { isVerified: true },
    );
    await this.verificationCodeRepository.delete({
      id: result.id,
    });
    const accessToken = this.getJwtAccessToken(
      result.user.id, result.user.email,
      result.user.firstName,
    );
    const refreshToken = this.getJwtRefreshToken(
      result.user.id, result.user.email,
      result.user.firstName,
    );
    return {
      accessToken,
      refreshToken,
      user: omit(result.user, ['password', 'currentHashedRefreshToken']),
    };
   
  }
  public getJwtAccessToken(userId:number,userEmail: string, firstName: string): string {
    const payload = { id: userId, fName: firstName };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>(
        'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
      ),
    });
    return token;
  }

  public getJwtRefreshToken(userId:number,userEmail: string, firstName: string): string {
    const payload= { id: userId, email:userEmail,fName: firstName};
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>(
        'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
      ),
    });
    return refreshToken;
  }
  async checkCodeExpiry(data: VerificationCode): Promise<boolean> {
    if (isBefore(new Date(), new Date(data.expiryDate))) {
      return true;
    }
    return false;
  }*/
  
  
  
  async checkIfRefreshTokenMatching(
    refreshToken: string,
    hashedRefreshedToken: string,
  ): Promise<boolean> {
    const isRefreshTokenMatching = await this.bcryptService.compare(
      refreshToken,
      hashedRefreshedToken,
    );
    return isRefreshTokenMatching;
  }



  validateUser(username: string, password: string): Observable<User> {
    return from(
      this.userRepository.findOne(
        { username },
        {
          select: ['id', 'firstName', 'lastName', 'email', 'password', 'role'],
        },
      ),
    ).pipe(
      switchMap((user: User) => {
        if (!user) {
          throw new HttpException(
            { status: HttpStatus.FORBIDDEN, error: 'Invalid Credentials' },
            HttpStatus.FORBIDDEN,
          );
        }
        return from(bcrypt.compare(password, user.password)).pipe(
          map((isValidPassword: boolean) => {
            if (isValidPassword) {
              delete user.password;
              return user;
            }
          }),
        );
      }),
    );
  }

  login(user: User): Observable<string> {
    const { username, password } = user;
    return this.validateUser(username, password).pipe(
      switchMap((user: User) => {
        if (user) {
          // create JWT - credentials
          return from(this.jwtService.signAsync({ user }));
        }
      }),
    );
  }

  getJwtUser(jwt: string): Observable<User | null> {
    return from(this.jwtService.verifyAsync(jwt)).pipe(
      map(({ user }: { user: User }) => {
        return user;
      }),
      catchError(() => {
        return of(null);
      }),
    );
  }
}
