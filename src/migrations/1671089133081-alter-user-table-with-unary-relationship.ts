import { MigrationInterface, QueryRunner } from 'typeorm';

export class alterUserTableWithUnaryRelationship1671089133081
  implements MigrationInterface
{
  name = 'alterUserTableWithUnaryRelationship1671089133081';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "managerId" integer`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_df69481de1f438f2082e4d54749" FOREIGN KEY ("managerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_df69481de1f438f2082e4d54749"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "managerId"`);
  }
}
