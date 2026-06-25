import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ShowtimesService } from './showtimes.service';

@Controller('showtimes')
@UseGuards(JwtAuthGuard)
export class ShowtimesClientController {
  constructor(private readonly showtimesService: ShowtimesService) {}

  @Get(':showtimeId/seats')
  getSeatMap(@Param('showtimeId', ParseIntPipe) showtimeId: number) {
    return this.showtimesService.getSeatMap(showtimeId);
  }
}
