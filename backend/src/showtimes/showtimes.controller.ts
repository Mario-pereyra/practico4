import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { ShowtimesService } from './showtimes.service';
import { CreateShowtimeDto } from './dto/create-showtime.dto';
import { UpdateShowtimeDto } from './dto/update-showtime.dto';
import { ShowtimesQueryDto } from './dto/showtimes-query.dto';

@Controller('admin/showtimes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class ShowtimesController {
  constructor(private readonly showtimesService: ShowtimesService) {}

  @Get()
  findAll(@Query() query: ShowtimesQueryDto) {
    return this.showtimesService.findAll(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateShowtimeDto) {
    return this.showtimesService.create(dto);
  }

  @Get(':showtimeId')
  async findOne(@Param('showtimeId', ParseIntPipe) showtimeId: number) {
    const showtime = await this.showtimesService.findOne(showtimeId);
    return this.showtimesService.formatDetail(showtime);
  }

  @Put(':showtimeId')
  update(
    @Param('showtimeId', ParseIntPipe) showtimeId: number,
    @Body() dto: UpdateShowtimeDto,
  ) {
    return this.showtimesService.update(showtimeId, dto);
  }

  @Delete(':showtimeId')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('showtimeId', ParseIntPipe) showtimeId: number) {
    return this.showtimesService.remove(showtimeId);
  }
}
