import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { ApiResponse } from '../interfaces';
import { Reflector } from '@nestjs/core';
import {
  NO_RESPONSE_FORMAT_KEY,
  RESPONSE_MESSAGE_KEY,
  ResponseMessageOpts,
} from '../decorators';

@Injectable()
export class SuccessResponseTransformInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<ApiResponse<T>> | Promise<Observable<ApiResponse<T>>> {
    const responseMessage = this.reflector.get<ResponseMessageOpts>(
      RESPONSE_MESSAGE_KEY,
      context.getHandler(),
    );
    const noResponseFormat = this.reflector.get<boolean>(
      NO_RESPONSE_FORMAT_KEY,
      context.getHandler(),
    );
    if (noResponseFormat) {
      return next.handle();
    }
    return next.handle().pipe(
      map((data) => {
        return {
          message: responseMessage?.message || 'Success',
          code: responseMessage?.statusCode || 200,
          metadata: data,
        };
      }),
    );
  }
}
