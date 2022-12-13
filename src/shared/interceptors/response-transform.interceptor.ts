import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GenericResponse } from '../interface/generic-response.interface';

/**
 * Represents Response interceptor used to format api response in a standard structure
 * constructing of statusCode, message & payload
 */
@Injectable()
export class ResponseTransformInterceptor<T>
  implements NestInterceptor<T, GenericResponse<T>>
{
  /**
   * Intercepting function which formats the response called from controllers
   * @param context interface holding all request properties
   * @param next interface giving access to response stream
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { url } = request;
    if (url?.includes('/api/metrics') || url?.includes('download')) {
      return next.handle();
    } else {
      return next.handle().pipe(
        map((data) => ({
          statusCode: context.switchToHttp().getResponse().statusCode,
          message: data.message || '',
          payload: data.results || {},
        })),
      );
    }
  }
}
