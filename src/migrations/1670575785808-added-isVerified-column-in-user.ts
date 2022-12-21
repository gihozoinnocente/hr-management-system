import { MigrationInterface, QueryRunner } from 'typeorm';

export class addedIsVerifiedColumnInUser1670575785808
  implements MigrationInterface
{
  name = 'addedIsVerifiedColumnInUser1670575785808';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "isVerified" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isVerified"`);
  }
}
