import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { Request } from 'express';
import { User, UserRole } from '../users/entities/user.entity';

interface AuthenticatedRequest extends Request {
  user: User;
}

@Controller('reservations')
@UseGuards(JwtAuthGuard)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateReservationDto) {
    return this.reservationsService.create(Number(req.user.id), dto);
  }

  @Get('my')
  @HttpCode(HttpStatus.OK)
  listMy(
    @Req() req: AuthenticatedRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.reservationsService.listMyReservations(
      Number(req.user.id),
      pageNum,
      limitNum,
    );
  }

  @Get(':reservationId')
  @HttpCode(HttpStatus.OK)
  findOne(
    @Req() req: AuthenticatedRequest,
    @Param('reservationId', ParseIntPipe) reservationId: number,
  ) {
    const isAdmin = req.user.role === UserRole.ADMIN;
    return this.reservationsService.getReservationDetail(
      reservationId,
      Number(req.user.id),
      isAdmin,
    );
  }
}
