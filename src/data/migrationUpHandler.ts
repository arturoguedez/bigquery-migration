import { BigQueryService } from '../services/bigQueryService';
import { IMigration } from './migrationInterface';

export class MigrationUpHandler {
    private migrationsTableName: string;
    private bigQueryService: BigQueryService;

    constructor(bigQueryService: BigQueryService, migrationsTableName: string) {
        this.migrationsTableName = migrationsTableName;
        this.bigQueryService = bigQueryService;
    }

    public handleUp(datasetId: string, migration: IMigration) {
        const migrationName = migration.getName();
        return migration.up(this.bigQueryService, datasetId)
            .then(() => {
                const toInsert = {
                    created_at: new Date(),
                    name: migrationName
                };

                return this.bigQueryService.insert(datasetId, this.migrationsTableName, toInsert, null)
                    .then(() => {
                        return Promise.resolve();
                    })
                    .catch((err) => {
                        return Promise.reject(`Errors found while recording the migration history: ${JSON.stringify(err)}`);
                    });
            })
            .catch((err) => {
                return Promise.reject(err);
            });
    }
}
export default MigrationUpHandler;
