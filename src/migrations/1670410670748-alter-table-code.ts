import { MigrationInterface, QueryRunner } from 'typeorm';

export class alterTableCode1670410670748 implements MigrationInterface {
  name = 'alterTableCode1670410670748';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "code" ADD "expiryDate" TIMESTAMP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "code" DROP COLUMN "expiryDate"`);
  }
}
