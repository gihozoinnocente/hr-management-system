import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Class representing a Request interceptor
 * for API requests to provide logging of users access types
 * a payload object
 * @author Awesomity Lab
 * @version 1.0
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const now = Date.now();
    Logger.log(
      `User is attempting to make a request to: ${url} ${method}`,
      context.getClass().name,
    );
    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - now;
        Logger.log(
          `User successfully made a request to:${url} ${method} ${duration}ms`,
          context.getClass().name,
        );
      }),
    );
  }
}
