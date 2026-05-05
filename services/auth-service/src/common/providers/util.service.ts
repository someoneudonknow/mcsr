import { Injectable } from '@nestjs/common';

@Injectable()
export class UtilService {
  isEmptyObject(object: Record<string, any>): boolean {
    return Object.keys(object).length === 0;
  }
}
