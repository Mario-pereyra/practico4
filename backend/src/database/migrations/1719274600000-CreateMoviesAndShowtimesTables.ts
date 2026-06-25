import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMoviesAndShowtimesTables1719274600000 implements MigrationInterface {
  name = 'CreateMoviesAndShowtimesTables1719274600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "movies" (
        "id" BIGSERIAL NOT NULL,
        "title" character varying(160) NOT NULL,
        "synopsis" character varying(2000) NOT NULL,
        "genre" character varying(20) NOT NULL,
        "duration_minutes" integer NOT NULL,
        "rating" character varying(15) NOT NULL,
        "poster_url" character varying(255) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_c5b2c10d2fa7bfdd275eb953b15" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "showtimes" (
        "id" BIGSERIAL NOT NULL,
        "starts_at" TIMESTAMP NOT NULL,
        "ends_at" TIMESTAMP NOT NULL,
        "price" numeric(10,2) NOT NULL,
        "currency" character varying(3) NOT NULL DEFAULT 'BOB',
        "movie_id" bigint,
        "room_id" bigint NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_43c7b1bcff6e4cb7912d09c6cd9" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "showtimes" ADD CONSTRAINT "FK_movie_id" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE RESTRICT
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "showtimes" DROP CONSTRAINT "FK_movie_id"`,
    );
    await queryRunner.query(`DROP TABLE "showtimes"`);
    await queryRunner.query(`DROP TABLE "movies"`);
  }
}
