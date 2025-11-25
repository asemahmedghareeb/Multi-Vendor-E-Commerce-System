import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1764055900681 implements MigrationInterface {
    name = 'InitialSchema1764055900681'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vendors" ADD "testField" text DEFAULT 'test'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vendors" DROP COLUMN "testField"`);
    }

}
