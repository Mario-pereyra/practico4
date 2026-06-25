import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRoomsAndSeatsTables1719275600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create rooms table
    await queryRunner.query(`
      CREATE TABLE "rooms" (
        "id" BIGSERIAL NOT NULL,
        "name" VARCHAR(100) NOT NULL,
        "rows" INTEGER NOT NULL,
        "columns" INTEGER NOT NULL,
        "capacity" INTEGER NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_rooms" PRIMARY KEY ("id")
      )
    `);

    // Create seats table
    await queryRunner.query(`
      CREATE TABLE "seats" (
        "id" BIGSERIAL NOT NULL,
        "room_id" BIGINT NOT NULL,
        "row_label" CHAR(1) NOT NULL,
        "column_number" INTEGER NOT NULL,
        "code" VARCHAR(4) NOT NULL,
        CONSTRAINT "PK_seats" PRIMARY KEY ("id"),
        CONSTRAINT "FK_seats_room" FOREIGN KEY ("room_id")
          REFERENCES "rooms" ("id") ON DELETE CASCADE
      )
    `);

    // Add room_id foreign key to showtimes table (was previously just a column)
    await queryRunner.query(`
      ALTER TABLE "showtimes"
        ADD CONSTRAINT "FK_showtimes_room"
        FOREIGN KEY ("room_id") REFERENCES "rooms" ("id") ON DELETE RESTRICT
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "showtimes" DROP CONSTRAINT IF EXISTS "FK_showtimes_room"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "seats"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "rooms"`);
  }
}
