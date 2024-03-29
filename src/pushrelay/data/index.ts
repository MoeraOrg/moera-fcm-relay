import { Sequelize } from 'sequelize-typescript';
import { DataTypes, QueryTypes } from 'sequelize';
import * as process from 'process';
import fs from 'fs/promises';

export let index: Sequelize;

export async function initDatabase(): Promise<void> {
    const connectionUrl = process.env.DATABASE;
    if (!connectionUrl) {
        console.error("moera-fcm-relay: database connection URL ('DATABASE' environment variable) is not set");
        process.exit(1);
    }
    index = new Sequelize(connectionUrl, {
        define: {
            timestamps: false,
            underscored: true,
            charset: 'utf8'
        },
        models: [__dirname + "/models/"],
        logging: false
    });
    await index.authenticate();

    await migrate();
}

interface Migration {
    n: number;
    fileName: string;
}

async function migrate(): Promise<void> {
    const version = await getCurrentVersion();
    const migrations: Migration[] = await listMigrations();
    await migrateFrom(version, migrations);
}

async function getCurrentVersion(): Promise<number> {
    const qi = index.getQueryInterface();

    let currentVersion = 0;
    if (!await qi.tableExists("version")) {
        await qi.createTable("version", {version: {type: DataTypes.INTEGER}});
        await qi.bulkInsert("version", [{version: 0}]);
    } else {
        const version: any[] = await index.query("select version from version", {type: QueryTypes.SELECT});
        currentVersion = version[0].version;
    }
    return currentVersion;
}

async function listMigrations(): Promise<Migration[]> {
    const migrations: Migration[] = [];

    const dir = await fs.opendir('migrations/');
    for await (const entry of dir) {
        const fileName = entry.name;
        const matches = fileName.match(/^V(\d+)(?:__.*)?\.sql$/);
        if (matches) {
            const n = parseInt(matches[1]);
            migrations.push({n, fileName: `migrations/${fileName}`});
        }
    }

    migrations.sort((m1, m2) => m1.n - m2.n);

    return migrations;
}

async function migrateFrom(version: number, migrations: Migration[]): Promise<void> {
    for (const migration of migrations) {
        if (migration.n <= version) {
            continue;
        }

        await index.transaction(async transaction => {
            const file = await fs.open(migration.fileName);
            let sql = '';
            for await (const line of file.readLines()) {
                sql += line;
                if (sql.match(/;\s*$/)) {
                    await index.query(sql, {transaction});
                    sql = '';
                }
            }

            await index.query(
                "update version set version=:version",
                {replacements: {version: migration.n}, type: QueryTypes.UPDATE, transaction}
            );
        });
    }
}
