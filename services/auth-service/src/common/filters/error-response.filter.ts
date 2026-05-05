import {
  ExceptionFilter,
  Catch,
  HttpException,
  ArgumentsHost,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ErrorMessages } from '../exceptions';

@Catch()
export class ErrorResponseFilter implements ExceptionFilter {
  private readonly logger = new Logger(ErrorResponseFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const isProd = false;

    let errorCode = 'INTERNAL_SERVER_ERROR';
    let errorMessage: string = 'An unexpected error occurred';
    let code = HttpStatus.INTERNAL_SERVER_ERROR;

    if (exception instanceof HttpException) {
      code = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== undefined
      ) {
        const payload = exceptionResponse as Record<string, any>;
        const rawMessage = payload['message'] || exception.message;

        if (rawMessage && typeof rawMessage === 'string') {
          errorMessage = ErrorMessages[rawMessage];
          errorCode = rawMessage;
        } else {
          errorCode = payload['errorCode'] || `HTTP_ERROR_${code}`;
          errorMessage = rawMessage || 'Internal Server Error';
        }
      }
    } else {
      this.logger.error(
        `Unhandled exception: ${exception}`,
        (exception as Error)?.stack,
      );
      if (!isProd) {
        errorMessage =
          exception instanceof Error ? exception.message : 'Unknown Error';
      }
    }

    res.status(code).json({
      success: false,
      message: errorMessage,
      code: errorCode,
      statusCode: code,
    });
  }
}
