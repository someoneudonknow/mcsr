import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { map, Observable } from 'rxjs';

type ClassConstructor = { new (...args: any[]): any };

export const Serialize = (dto: ClassConstructor) => {
  return UseInterceptors(new ClassSerializeInterceptor(dto));
};

@Injectable()
export class ClassSerializeInterceptor implements NestInterceptor {
  constructor(private readonly dto: ClassConstructor) {}

  intercept(
    _: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(map((data) => plainToClass(this.dto, data)));
  }
}
