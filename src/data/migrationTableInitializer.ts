import { BigQueryService } from '../services/bigQueryService';

export class MigrationTableInitializer {
    private migrationsTableName: string;
    private bigQueryService: BigQueryService;

    constructor(bigQueryService: BigQueryService, migrationsTableName: string) {
        this.migrationsTableName = migrationsTableName;
        this.bigQueryService = bigQueryService;
    }

    public initMigrationTable(datasetId: string) {
        return this.bigQueryService.listTables(datasetId)
            .then((tableNames) => {
                const migrationTableExists: boolean = tableNames.some((tableName) => {
                    return tableName === this.migrationsTableName;
                });

                if (migrationTableExists) {
                    return Promise.resolve();
                } else {
                    const schema =
                        [
                            {
                                mode: 'REQUIRED',
                                name: 'name',
                                type: 'STRING'
                            },
                            {
                                mode: 'REQUIRED',
                                name: 'created_at',
                                type: 'TIMESTAMP'
                            }
                        ];
                    return this.bigQueryService.createTable(datasetId, this.migrationsTableName, schema);
                }
            });
    }
}

export default MigrationTableInitializer;
