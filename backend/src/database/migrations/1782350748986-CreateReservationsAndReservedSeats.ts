import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateReservationsAndReservedSeats1782350748986 implements MigrationInterface {
    name = 'CreateReservationsAndReservedSeats1782350748986'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "seats" DROP CONSTRAINT "FK_seats_room"`);
        await queryRunner.query(`ALTER TABLE "showtimes" DROP CONSTRAINT "FK_movie_id"`);
        await queryRunner.query(`ALTER TABLE "showtimes" DROP CONSTRAINT "FK_showtimes_room"`);
        await queryRunner.query(`CREATE TABLE "reserved_seats" ("id" BIGSERIAL NOT NULL, "reservation_id" bigint NOT NULL, "showtime_id" bigint NOT NULL, "seat_id" bigint NOT NULL, "row_label" character(1) NOT NULL, "column_number" integer NOT NULL, "code" character varying(4) NOT NULL, "unit_price" numeric(10,2) NOT NULL, CONSTRAINT "UQ_30044b0a78c1be1f020335745c8" UNIQUE ("showtime_id", "seat_id"), CONSTRAINT "PK_39dd66cb6b56e92e75184aed532" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "reservations" ("id" BIGSERIAL NOT NULL, "user_id" bigint NOT NULL, "showtime_id" bigint NOT NULL, "total" numeric(10,2) NOT NULL, "currency" character varying(3) NOT NULL DEFAULT 'BOB', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_da95cef71b617ac35dc5bcda243" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "showtimes" ALTER COLUMN "movie_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "seats" ADD CONSTRAINT "FK_657a29871b8dd6a5107da320458" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "showtimes" ADD CONSTRAINT "FK_cbe689b0c116fbc866d8ea21759" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "showtimes" ADD CONSTRAINT "FK_7dac5a1df6dbc1f355112a11d8d" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reserved_seats" ADD CONSTRAINT "FK_977a86b37fa4212255c06c5d304" FOREIGN KEY ("reservation_id") REFERENCES "reservations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reserved_seats" ADD CONSTRAINT "FK_7a73adeb9a8e403214c1e403bce" FOREIGN KEY ("showtime_id") REFERENCES "showtimes"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reserved_seats" ADD CONSTRAINT "FK_4f684ed1d7a6056632549e5ae2c" FOREIGN KEY ("seat_id") REFERENCES "seats"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reservations" ADD CONSTRAINT "FK_4af5055a871c46d011345a255a6" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reservations" ADD CONSTRAINT "FK_e1355b3e5e4de3590d1e11f83e1" FOREIGN KEY ("showtime_id") REFERENCES "showtimes"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reservations" DROP CONSTRAINT "FK_e1355b3e5e4de3590d1e11f83e1"`);
        await queryRunner.query(`ALTER TABLE "reservations" DROP CONSTRAINT "FK_4af5055a871c46d011345a255a6"`);
        await queryRunner.query(`ALTER TABLE "reserved_seats" DROP CONSTRAINT "FK_4f684ed1d7a6056632549e5ae2c"`);
        await queryRunner.query(`ALTER TABLE "reserved_seats" DROP CONSTRAINT "FK_7a73adeb9a8e403214c1e403bce"`);
        await queryRunner.query(`ALTER TABLE "reserved_seats" DROP CONSTRAINT "FK_977a86b37fa4212255c06c5d304"`);
        await queryRunner.query(`ALTER TABLE "showtimes" DROP CONSTRAINT "FK_7dac5a1df6dbc1f355112a11d8d"`);
        await queryRunner.query(`ALTER TABLE "showtimes" DROP CONSTRAINT "FK_cbe689b0c116fbc866d8ea21759"`);
        await queryRunner.query(`ALTER TABLE "seats" DROP CONSTRAINT "FK_657a29871b8dd6a5107da320458"`);
        await queryRunner.query(`ALTER TABLE "showtimes" ALTER COLUMN "movie_id" DROP NOT NULL`);
        await queryRunner.query(`DROP TABLE "reservations"`);
        await queryRunner.query(`DROP TABLE "reserved_seats"`);
        await queryRunner.query(`ALTER TABLE "showtimes" ADD CONSTRAINT "FK_showtimes_room" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "showtimes" ADD CONSTRAINT "FK_movie_id" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "seats" ADD CONSTRAINT "FK_seats_room" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
