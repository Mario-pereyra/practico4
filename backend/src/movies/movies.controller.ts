import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import { Request } from 'express';
import { MoviesService } from './movies.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { MoviesQueryDto } from './dto/movies-query.dto';

// Ensure the posters upload directory exists
fs.mkdirSync('./uploads/posters', { recursive: true });

const storage = diskStorage({
  destination: './uploads/posters',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void,
) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new BadRequestException({
        statusCode: 400,
        code: 'VALIDATION_ERROR',
        message: 'La solicitud contiene datos inválidos.',
        errors: [
          {
            field: 'poster',
            message: 'Solo se permiten imágenes JPEG, PNG o WebP.',
          },
        ],
      }),
      false,
    );
  }
};

@Controller('admin/movies')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get()
  async list(@Query() query: MoviesQueryDto) {
    return this.moviesService.listAdminMovies(query);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('poster', {
      storage,
      fileFilter,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    }),
  )
  async create(
    @Body() dto: CreateMovieDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException({
        statusCode: 400,
        code: 'VALIDATION_ERROR',
        message: 'La solicitud contiene datos inválidos.',
        errors: [
          {
            field: 'poster',
            message:
              'El archivo del póster no fue proporcionado o supera los 5 MB.',
          },
        ],
      });
    }
    const posterPath = `/uploads/posters/${file.filename}`;
    return this.moviesService.create(dto, posterPath);
  }

  @Get(':movieId')
  async getOne(@Param('movieId', ParseIntPipe) movieId: number) {
    return this.moviesService.getMovieById(movieId);
  }

  @Put(':movieId')
  @UseInterceptors(
    FileInterceptor('poster', {
      storage,
      fileFilter,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    }),
  )
  async update(
    @Param('movieId', ParseIntPipe) movieId: number,
    @Body() dto: UpdateMovieDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const posterPath = file ? `/uploads/posters/${file.filename}` : undefined;
    return this.moviesService.update(movieId, dto, posterPath);
  }

  @Delete(':movieId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('movieId', ParseIntPipe) movieId: number) {
    await this.moviesService.delete(movieId);
  }
}
