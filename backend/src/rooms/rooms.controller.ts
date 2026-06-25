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
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomsQueryDto } from './dto/rooms-query.dto';

@Controller('admin/rooms')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  findAll(@Query() query: RoomsQueryDto) {
    return this.roomsService.findAll(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateRoomDto) {
    return this.roomsService.create(dto);
  }

  @Get(':roomId')
  findOne(@Param('roomId', ParseIntPipe) roomId: number) {
    return this.roomsService.findOne(roomId);
  }

  @Put(':roomId')
  update(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Body() dto: UpdateRoomDto,
  ) {
    return this.roomsService.update(roomId, dto);
  }

  @Delete(':roomId')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('roomId', ParseIntPipe) roomId: number) {
    return this.roomsService.remove(roomId);
  }

  @Get(':roomId/seats')
  findSeats(@Param('roomId', ParseIntPipe) roomId: number) {
    return this.roomsService.findSeats(roomId);
  }
}
