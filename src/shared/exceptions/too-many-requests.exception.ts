import { HttpException, HttpStatus } from '@nestjs/common';

export class TooManyRequestsException extends HttpException {
  constructor(message: string) {
    super(
      {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: message || 'Too many requests',
        error: 'Too many requests',
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
