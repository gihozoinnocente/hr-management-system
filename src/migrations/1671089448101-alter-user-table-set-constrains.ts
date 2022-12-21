import { MigrationInterface, QueryRunner } from 'typeorm';

export class alterUserTableSetConstrains1671089448101
  implements MigrationInterface
{
  name = 'alterUserTableSetConstrains1671089448101';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_df69481de1f438f2082e4d54749"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_df69481de1f438f2082e4d54749" FOREIGN KEY ("managerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE SET NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_df69481de1f438f2082e4d54749"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_df69481de1f438f2082e4d54749" FOREIGN KEY ("managerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }
}
