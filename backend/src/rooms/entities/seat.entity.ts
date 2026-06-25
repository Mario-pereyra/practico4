import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Room } from './room.entity';

@Entity('seats')
export class Seat {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'room_id', type: 'bigint' })
  roomId: number;

  @ManyToOne(() => Room, (room) => room.seats, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'room_id' })
  room: Room;

  @Column({ name: 'row_label', type: 'char', length: 1 })
  rowLabel: string;

  @Column({ name: 'column_number', type: 'integer' })
  columnNumber: number;

  @Column({ type: 'varchar', length: 4 })
  code: string;
}
