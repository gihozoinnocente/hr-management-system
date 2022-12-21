import { MigrationInterface, QueryRunner } from 'typeorm';

export class createDepartmentTable1670407327890 implements MigrationInterface {
  name = 'createDepartmentTable1670407327890';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "department" ("isDeleted" boolean NOT NULL DEFAULT false, "createdOn" TIMESTAMP NOT NULL DEFAULT now(), "lastUpdatedOn" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "department_name" character varying NOT NULL, "userId" integer, CONSTRAINT "PK_9a2213262c1593bffb581e382f5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile" DROP COLUMN "department_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile" ADD "isDeleted" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile" ADD "createdOn" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile" ADD "lastUpdatedOn" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "profile" ADD "departmentId" integer`);
    await queryRunner.query(
      `ALTER TABLE "profile" ADD CONSTRAINT "FK_8d6f88161620c6b048326cbd69e" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    // await queryRunner.query(
    //   `ALTER TABLE "department" ADD CONSTRAINT "FK_1809e8e6311c8b2c88c5c2ef733" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    // );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "department" DROP CONSTRAINT "FK_1809e8e6311c8b2c88c5c2ef733"`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile" DROP CONSTRAINT "FK_8d6f88161620c6b048326cbd69e"`,
    );
    await queryRunner.query(`ALTER TABLE "profile" DROP COLUMN "departmentId"`);
    await queryRunner.query(
      `ALTER TABLE "profile" DROP COLUMN "lastUpdatedOn"`,
    );
    await queryRunner.query(`ALTER TABLE "profile" DROP COLUMN "createdOn"`);
    await queryRunner.query(`ALTER TABLE "profile" DROP COLUMN "isDeleted"`);
    await queryRunner.query(
      `ALTER TABLE "profile" ADD "department_id" integer NOT NULL`,
    );
    await queryRunner.query(`DROP TABLE "department"`);
  }
}
