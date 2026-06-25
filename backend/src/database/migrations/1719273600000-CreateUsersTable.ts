import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1719273600000 implements MigrationInterface {
  name = 'CreateUsersTable1719273600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" BIGSERIAL NOT NULL,
        "name" character varying(100) NOT NULL,
        "email" character varying(254) NOT NULL,
        "password" character varying(128) NOT NULL,
        "role" character varying(10) NOT NULL DEFAULT 'CLIENT',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_97672ac88f1371f1227b85b897e" UNIQUE ("email"),
        CONSTRAINT "PK_a3c148b5cff4087a81200d7dd6d" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
