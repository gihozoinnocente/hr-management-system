import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';
import { TypeOrmException } from '../exceptions/typeorm-exception.exception';
import { PostgresErrorCode } from '../enums/postgres-error-code.enum';

@Catch(QueryFailedError)
export class DatabaseExceptionFilter<T extends TypeOrmException>
  implements ExceptionFilter
{
  catch(exception: T, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const { url } = request;
    const { message, detail, code } = exception;
    const status = HttpStatus.CONFLICT;
    const errorMessage = this.getMessageByCode(code, message, detail);
    const errorResponse = {
      statusCode: status,
      path: url,
      message: errorMessage,
      error: detail,
      timestamp: new Date().toISOString(),
    };

    Logger.error(
      `${request.url} ${request.method}`,
      exception.stack,
      'DatabaseExceptionFilter',
    );

    response.status(status).json(errorResponse);
  }

  getMessageByCode(
    code: string,
    message: string,
    detail?: string,
  ): string | string[] {
    switch (code) {
      case PostgresErrorCode.UniqueViolation:
        const msg = this.getConstraintKeyMessage(detail);
        return [msg];
      default:
        return message;
    }
  }

  getConstraintKeyMessage(message: string): string {
    try {
      const regExp = /\(([^)]+)\)/;
      const matches = regExp.exec(message);
      const key = matches[1];
      if (key) {
        const n = message.lastIndexOf(')');
        const explanation = message.substring(n + 1);
        return `${key}${explanation}`;
      } else {
        return message;
      }
    } catch (error) {
      Logger.error(
        `Could not format database exception message`,
        error,
        'DatabaseExceptionFilter',
      );
      return message;
    }
  }
}
