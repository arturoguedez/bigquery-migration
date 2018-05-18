import { BigQueryService } from '../services/bigQueryService';
import logger from '../utils/logger';
import { MigrationDownHandler } from './migrationDownHandler';
import { MigrationFactory } from './migrationFactory';
import { MigrationUpHandler } from './migrationUpHandler';

export class MigrationApplier {
    private migrationDownHandler: MigrationDownHandler;
    private migrationFactory: MigrationFactory;
    private migrationUpHandler: MigrationUpHandler;

    constructor(bigQueryService: BigQueryService, migrationsTableName: string) {
        this.migrationFactory = new MigrationFactory();
        this.migrationUpHandler = new MigrationUpHandler(bigQueryService, migrationsTableName);
        this.migrationDownHandler = new MigrationDownHandler(bigQueryService);
    }

    public applyMigrations(datasetId: string, pendingMigrations: string[]) {
        const migrationName = pendingMigrations.shift();

        if (!migrationName) {
            return Promise.resolve();
        }

        return this.migrationFactory.create(migrationName)
            .then((migration) => {
                logger.debug(`About to handle up() for migration ${migrationName}`);
                return this.migrationUpHandler.handleUp(datasetId, migration)
                    .then(() => {
                        return Promise.resolve();
                    })
                    .catch((err) => {
                        logger.debug(`About to handle down() for migration ${migrationName}`);
                        return this.migrationDownHandler.handleDown(datasetId, migration)
                            .then(() => {
                                return Promise.reject(`Migration ${migration.getName()} has been rolled back. Error from up(): ${err}`);
                            }).catch((err2) => {
                                return Promise.reject(err2);
                            });
                    });
            }).then(() => {
                return this.applyMigrations(datasetId, pendingMigrations);
            })
            .catch((err) => {
                return Promise.reject(err);
            });
    }
}
export default MigrationApplier;
