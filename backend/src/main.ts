import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
  }

  const app = await NestFactory.create(AppModule);

  // Configure global URL prefix
  app.setGlobalPrefix('api/v1');

  // Serve static files from uploads folder
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  });

  // Register global HttpExceptionFilter to format all error responses according to OpenAPI contract
  app.useGlobalFilters(new HttpExceptionFilter());

  // Configure ValidationPipe to match exact validation errors format
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const flattenErrors = (
          errorList: ValidationError[],
          parentProperty = '',
        ) => {
          const result: { field: string; message: string }[] = [];
          for (const error of errorList) {
            const propertyPath = parentProperty
              ? `${parentProperty}.${error.property}`
              : error.property;
            if (error.constraints) {
              result.push({
                field: propertyPath,
                message: Object.values(error.constraints).join(', '),
              });
            }
            if (error.children && error.children.length > 0) {
              result.push(...flattenErrors(error.children, propertyPath));
            }
          }
          return result;
        };

        const formattedErrors = flattenErrors(errors);
        return new BadRequestException({
          statusCode: 400,
          code: 'VALIDATION_ERROR',
          message: 'La solicitud contiene datos inválidos.',
          errors: formattedErrors,
        });
      },
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
