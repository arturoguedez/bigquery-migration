import { BigQueryService } from '../services/bigQueryService';
import { IMigration } from './migrationInterface';

export class MigrationDownHandler {
    private bigQueryService: BigQueryService;

    constructor(bigQueryService: BigQueryService) {
        this.bigQueryService = bigQueryService;
    }

    public handleDown(datasetId: string, migration: IMigration) {
        return migration.down(this.bigQueryService, datasetId)
            .then(() => {
                return Promise.resolve();
            })
            .catch((err) => {
                return Promise.reject(`Rollback failed for migration '${migration.getName()}'. Error: ${JSON.stringify(err)}`);
            });
    }
}
export default MigrationDownHandler;
