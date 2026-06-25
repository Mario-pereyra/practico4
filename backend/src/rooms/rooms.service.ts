import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Room } from './entities/room.entity';
import { Seat } from './entities/seat.entity';
import { Showtime } from '../showtimes/entities/showtime.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomsQueryDto } from './dto/rooms-query.dto';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room) private readonly roomRepository: Repository<Room>,
    @InjectRepository(Seat) private readonly seatRepository: Repository<Seat>,
    @InjectRepository(Showtime)
    private readonly showtimeRepository: Repository<Showtime>,
    private readonly dataSource: DataSource,
  ) {}

  private buildSeatsForRoom(
    roomId: number,
    rows: number,
    columns: number,
  ): Partial<Seat>[] {
    const seats: Partial<Seat>[] = [];
    for (let r = 0; r < rows; r++) {
      const rowLabel = String.fromCharCode(65 + r);
      for (let c = 1; c <= columns; c++) {
        seats.push({
          roomId,
          rowLabel,
          columnNumber: c,
          code: `${rowLabel}${c}`,
        });
      }
    }
    return seats;
  }

  async findAll(query: RoomsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const [data, total] = await this.roomRepository.findAndCount({
      order: { id: 'ASC' },
      skip,
      take: limit,
    });

    return {
      items: data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number): Promise<Room> {
    const room = await this.roomRepository.findOne({ where: { id } });
    if (!room) {
      throw new NotFoundException({
        statusCode: 404,
        code: 'ROOM_NOT_FOUND',
        message: `Sala con id ${id} no encontrada.`,
      });
    }
    return room;
  }

  async create(dto: CreateRoomDto): Promise<Room> {
    const capacity = dto.rows * dto.columns;

    return this.dataSource.transaction(async (manager) => {
      const room = manager.create(Room, {
        name: dto.name,
        rows: dto.rows,
        columns: dto.columns,
        capacity,
      });
      const savedRoom = await manager.save(Room, room);

      const seats = this.buildSeatsForRoom(savedRoom.id, dto.rows, dto.columns);
      await manager.save(
        Seat,
        seats.map((s) => manager.create(Seat, s)),
      );

      return savedRoom;
    });
  }

  async update(id: number, dto: UpdateRoomDto): Promise<Room> {
    const room = await this.findOne(id);

    const layoutChanged =
      dto.rows !== room.rows || dto.columns !== room.columns;

    if (layoutChanged) {
      // Check for associated showtimes
      const showtimeCount = await this.showtimeRepository.count({
        where: { roomId: id },
      });
      if (showtimeCount > 0) {
        throw new ConflictException({
          statusCode: 409,
          code: 'ROOM_LAYOUT_LOCKED',
          message:
            'No se puede cambiar la distribución porque la sala tiene funciones asociadas.',
        });
      }
    }

    return this.dataSource.transaction(async (manager) => {
      room.name = dto.name;

      if (layoutChanged) {
        room.rows = dto.rows;
        room.columns = dto.columns;
        room.capacity = dto.rows * dto.columns;

        await manager.delete(Seat, { roomId: id });

        const newSeats = this.buildSeatsForRoom(id, dto.rows, dto.columns);
        await manager.save(
          Seat,
          newSeats.map((s) => manager.create(Seat, s)),
        );
      }

      return manager.save(Room, room);
    });
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id); // ensures 404 if not found

    const showtimeCount = await this.showtimeRepository.count({
      where: { roomId: id },
    });
    if (showtimeCount > 0) {
      throw new ConflictException({
        statusCode: 409,
        code: 'ROOM_HAS_SHOWTIMES',
        message: 'La sala tiene funciones asociadas.',
      });
    }

    // Seats cascade-delete via DB foreign key
    await this.roomRepository.delete(id);
  }

  async findSeats(roomId: number): Promise<Seat[]> {
    await this.findOne(roomId); // ensures 404 if room not found
    return this.seatRepository.find({
      where: { roomId },
      order: { rowLabel: 'ASC', columnNumber: 'ASC' },
    });
  }
}
