import {MigrationInterface, QueryRunner} from "typeorm";

export class createUserAndCodeTables1670410108870 implements MigrationInterface {
    name = 'createUserAndCodeTables1670410108870'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user" ("isDeleted" boolean NOT NULL DEFAULT false, "createdOn" TIMESTAMP NOT NULL DEFAULT now(), "lastUpdatedOn" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "phone_number" character varying NOT NULL, "role" character varying NOT NULL DEFAULT 'standard', "active" boolean DEFAULT false, "currentHashedRefreshToken" character varying, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "UQ_01eea41349b6c9275aec646eee0" UNIQUE ("phone_number"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "code" ("id" SERIAL NOT NULL, "code" character varying NOT NULL, "userId" integer, CONSTRAINT "REL_76c04a353b3639752b096e75ec" UNIQUE ("userId"), CONSTRAINT "PK_367e70f79a9106b8e802e1a9825" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "code" ADD CONSTRAINT "FK_76c04a353b3639752b096e75ec4" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "code" DROP CONSTRAINT "FK_76c04a353b3639752b096e75ec4"`);
        await queryRunner.query(`DROP TABLE "code"`);
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
