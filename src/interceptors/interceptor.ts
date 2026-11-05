import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  message: string;
  data: T;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function canHaveProperties(value: unknown): value is Record<string, unknown> {
  return isObject(value) || typeof value === 'function';
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((res: unknown) => {
        const message = (canHaveProperties(res) && res.message) || 'Success';
        const data = isObject(res) && 'data' in res ? res.data : res;
        const isOnlyMessage =
          isObject(res) && Object.keys(res).length === 1 && 'message' in res;
        const finalData = isOnlyMessage ? null : data;

        return {
          message: message as string,
          data: finalData as T,
        };
      }),
    );
  }
}
