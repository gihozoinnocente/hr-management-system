import { MigrationInterface, QueryRunner } from 'typeorm';

export class createProfileTable1670403526862 implements MigrationInterface {
  name = 'createProfileTable1670403526862';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "profile" ("id" SERIAL NOT NULL, "resident_country" character varying NOT NULL, "birth_country" character varying NOT NULL, "national_id" character varying NOT NULL, "position" character varying NOT NULL, "postal_code" character varying NOT NULL, "starting_date" TIMESTAMP NOT NULL, "profession" character varying NOT NULL, "department_id" integer NOT NULL, "salary" character varying NOT NULL, "father_name" character varying NOT NULL, "mother_name" character varying NOT NULL, "gender" character varying NOT NULL, "birth_date" character varying NOT NULL, "province" character varying NOT NULL, "district" character varying NOT NULL, CONSTRAINT "PK_3dd8bfc97e4a77c70971591bdcb" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "profile"`);
  }
}
