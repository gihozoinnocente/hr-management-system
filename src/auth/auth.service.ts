import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
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
import {
  ACCOUNT_ALREADY_VERIFIED,
  ACCOUNT_IN_DORMANT_MODE,
  INVALID_CREDENTIAL,
  INVALID_VERIFICATION_CODE,
  NO_ACCESS_TO_THE_PORTAL,
  UNVERIFIED_ACCOUNT,
  VERIFICATION_CODE_EXPIRED,
  VERIFICATION_EMAIL_SUBJECT,
  YOU_CAN_LOGIN_WITH_EITHER_EMAIL_OR_PHONE_NUMBER,
} from 'src/shared/constants/auth.constants';

import { TokenPayload } from './interfaces/jwt.payload.interface';
import { USER_NOT_FOUND } from 'src/shared/constants/user.constants';
import { EMAIL_REGEX } from 'src/shared/constants/regex.constant';
import { Code } from 'src/users/entities/code.entity';
import { UserRole } from '../shared/enums/user-roles.enum';
import { ChangePasswordDto } from './dto/change-password.dto';

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

  async registerUser(createUserDto: CreateUserDto): Promise<any> {
    const user = { ...createUserDto };
    user.password = await this.bcryptService.hash(user.password);
    if (await this.checkUserExisting(user.email)) {
      throw new ConflictException('User with this email already exist.');
    } else {
      const registeredUser = await this.userRepository.save({
        email: user.email,
        password: user.password,
        phone_number: user.phone_number,
        first_name: user.first_name,
        last_name: user.last_name,
        manager: null,
        role: UserRole.STANDARD,
      });
      const verificationCode = codeGenerator();
      await this.verificationCodeRepository.save({
        code: verificationCode,
        user: registeredUser,
        expiryDate: new Date(),
      });
      const verificationMail = {
        to: user.email,
        subject: VERIFICATION_EMAIL_SUBJECT,
        from: this.configService.get<string>('SENT_EMAIL_FROM'),
        text: `Hello verify the account`,
        html: `<h1>Hello @ ${registeredUser.first_name} please use the code below to verify your account ${verificationCode} </h1>`,
      };
      await this.sendGridService.send(verificationMail);
      return registeredUser;
    }
    return user;
  }

  async checkUserExisting(email: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ email: email });
    //console.log(user)
    if (user) {
      return true;
    } else {
      return false;
    }
  }
  async requestVerification(emailorPhone: string): Promise<void> {
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
      const body: string =
        'Hello ' +
        user.first_name +
        ', Please verify your account by entering this code: ' +
        verificationCode.code;
      const verificationMail = {
        to: user.email,
        subject: VERIFICATION_EMAIL_SUBJECT,
        from: process.env.SENT_EMAIL_FROM,
        text: body,
        html: '<h1>' + body + '</h2>',
      };
      await this.sendGridService.send(verificationMail);
    }
  }
  async findUserByEmailOrPhoneNumber(emailorPhone: string): Promise<User> {
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
        phone_number: emailorPhone,
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
  async verification(code: string): Promise<any> {
    const result = await this.verificationCodeRepository.findOne({
      where: { code: code },
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
    /* const accessToken = this.getJwtAccessToken(
    user.id, user.email,
    user.first_name,user.last_name,user.manager_id,
  );
  const refreshToken = this.getJwtRefreshToken(
    user.id, user.email,
    user.first_name,user.last_name,user.manager_id,
  );*/
    return {
      // accessToken,
      // refreshToken,
      user: omit(result.user, ['password', 'currentHashedRefreshToken']),
    };
  }
  public getJwtAccessToken(userId: number, userEmail: string): string {
    const payload = { username: userEmail, sub: userId };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>(
        'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
      ),
    });
    return token;
  }

  public getJwtRefreshToken(userId: number, userEmail: string): string {
    const payload = { username: userEmail, sub: userId };
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>(
        'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
      ),
    });
    return refreshToken;
  }
  async checkCodeExpiry(data: Code): Promise<boolean> {
    if (isBefore(new Date(), new Date(data.expiryDate))) {
      return true;
    }
    return false;
  }

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
  async adminLogin(password: string, email: string) {
    const user = await this.findUserByEmailOrPhoneNumber(email);
    if (user) {
      if (
        ((await this.bcryptService.compare(password, user.password)) &&
          email === user.email) ||
        ((await this.bcryptService.compare(password, user.password)) &&
          email === user.phone_number)
      ) {
        if (user.isVerified) {
          if (user.active) {
            if (user.role == UserRole.ADMIN) {
              const accessToken = this.getJwtAccessToken(user.id, user.email);
              const refreshToken = this.getJwtRefreshToken(user.id, user.email);
              await this.setCurrentHashedRefreshToken(refreshToken, user.id);
              const result = {
                accessToken,
                refreshToken,
                user: omit(user, ['password', 'currentHashedRefreshToken']),
              };
              return result;
            } else {
              throw new ConflictException(NO_ACCESS_TO_THE_PORTAL);
            }
          } else {
            throw new ConflictException(ACCOUNT_IN_DORMANT_MODE);
          }
        } else {
          throw new ConflictException(UNVERIFIED_ACCOUNT);
        }
      } else {
        throw new ConflictException(INVALID_CREDENTIAL);
      }
    } else {
      throw new ConflictException(
        YOU_CAN_LOGIN_WITH_EITHER_EMAIL_OR_PHONE_NUMBER,
      );
    }
  }
  async standardUserLogin(password: string, email: string) {
    const user = await this.findUserByEmailOrPhoneNumber(email);
    if (user) {
      if (
        ((await this.bcryptService.compare(password, user.password)) &&
          email === user.email) ||
        ((await this.bcryptService.compare(password, user.password)) &&
          email === user.phone_number)
      ) {
        if (user.isVerified) {
          if (user.active) {
            if (user.role == UserRole.STANDARD) {
              const accessToken = this.getJwtAccessToken(user.id, user.email);
              const refreshToken = this.getJwtRefreshToken(user.id, user.email);
              await this.setCurrentHashedRefreshToken(refreshToken, user.id);
              const result = {
                accessToken,
                refreshToken,
                user: omit(user, ['password', 'currentHashedRefreshToken']),
              };
              return result;
            } else {
              throw new ConflictException(NO_ACCESS_TO_THE_PORTAL);
            }
          } else {
            throw new ConflictException(ACCOUNT_IN_DORMANT_MODE);
          }
        } else {
          throw new ConflictException(UNVERIFIED_ACCOUNT);
        }
      } else {
        throw new ConflictException(INVALID_CREDENTIAL);
      }
    } else {
      throw new ConflictException(
        YOU_CAN_LOGIN_WITH_EITHER_EMAIL_OR_PHONE_NUMBER,
      );
    }
  }
  async setCurrentHashedRefreshToken(refreshToken: string, id: number) {
    const hashedRefreshToken = await this.bcryptService.hash(refreshToken);
    await this.userRepository.update(
      { id: id },
      { currentHashedRefreshToken: hashedRefreshToken },
    );
  }
  async changePassword(
    userToUpdate: User,
    psdDto: ChangePasswordDto,
  ): Promise<any> {
    const user = await this.userRepository.findOne({ id: userToUpdate.id });
    if (
      await this.bcryptService.compare(
        psdDto.currentPassword,
        userToUpdate.password,
      )
    ) {
      if (!(psdDto.currentPassword === psdDto.newPassword)) {
        const updateduser = await this.userRepository.update(
          { id: userToUpdate.id },
          { password: await this.bcryptService.hash(psdDto.newPassword) },
        );
        return {
          user: omit(updateduser, ['password', 'currentHashedRefreshToken']),
        };
      } else {
        throw new ConflictException(
          "The current and new passwords can't match",
        );
      }
    } else {
      throw new ConflictException(
        "The current and existing passwords don't match",
      );
    }
  }
}
