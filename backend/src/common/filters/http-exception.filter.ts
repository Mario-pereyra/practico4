import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // If the exception body already matches the format, return it
    if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'code' in exceptionResponse
    ) {
      return response.status(status).json(exceptionResponse);
    }

    // Map standard NestJS exceptions to OpenAPI spec formats
    let code = 'INTERNAL_SERVER_ERROR';
    let message = exception.message || 'Error interno del servidor';

    if (status === Number(HttpStatus.UNAUTHORIZED)) {
      code = 'UNAUTHORIZED';
      message = 'Se requiere autenticación válida.';
    } else if (status === Number(HttpStatus.FORBIDDEN)) {
      code = 'FORBIDDEN';
      message = 'El usuario no tiene permisos para esta operación.';
    } else if (status === Number(HttpStatus.NOT_FOUND)) {
      code = 'NOT_FOUND';
    } else if (status === Number(HttpStatus.BAD_REQUEST)) {
      code = 'BAD_REQUEST';
    } else if (status === Number(HttpStatus.CONFLICT)) {
      code = 'CONFLICT';
    }

    response.status(status).json({
      statusCode: status,
      code,
      message,
    });
  }
}
